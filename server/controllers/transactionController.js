const dotenv = require("dotenv");
dotenv.config();

const Transaction = require('../models/transaction');
const mongoose = require('mongoose');
const fs = require('fs');
const mime = require('mime-types');

const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    // Extract query parameters for pagination and sorting
    const { limit, sort } = req.query;
    
    // Build the query
    let query = Transaction.find({ user: req.user.id });
    
    // Apply sorting (default to date descending)
    const sortBy = sort || '-date';
    query = query.sort(sortBy);
    
    // Apply limit if specified
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    // Execute the query
    const transactions = await query;

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
exports.addTransaction = async (req, res, next) => {
  try {
    // Add user ID to the request body
    req.body.user = req.user.id;
    
    const transaction = await Transaction.create(req.body);

    return res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
    try {
        let transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ success: false, error: 'No transaction found' });
        }

        // Make sure user owns the transaction
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this transaction' });
        }

        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'No transaction found' });
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user.id) {
        return res.status(401).json({ success: false, error: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();

    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all unique categories for the logged-in user
// @route   GET /api/transactions/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    // Find distinct categories belonging to the user
    const categories = await Transaction.find({ user: req.user.id }).distinct('category');

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get financial summary (totals, breakdowns) for the user
// @route   GET /api/transactions/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    // Build the base match stage
    const matchCriteria = { user: userId };
    if (startDate || endDate) {
      matchCriteria.date = {};
      if (startDate) {
        matchCriteria.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Add 1 day to endDate to include the entire day
        const endOfDay = new Date(endDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        matchCriteria.date.$lt = endOfDay;
      }
    }

    // Use $facet to run multiple aggregations in parallel
    const summaryData = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $facet: {
          // Pipeline 1: Get total income vs total expense
          summary: [
            {
              $group: {
                _id: '$type', // Group by 'income' or 'expense'
                total: { $sum: '$amount' },
              },
            },
          ],
          // Pipeline 2: Get breakdown of expenses by category
          categoryBreakdown: [
            { $match: { type: 'expense' } }, // Only look at expenses
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
              },
            },
            { $sort: { total: -1 } }, // Sort largest expense category first
          ],
          // Pipeline 3: Get monthly trends
          monthlyTrends: [
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' },
                  type: '$type',
                },
                total: { $sum: '$amount' },
              },
            },
            {
              $sort: {
                '_id.year': 1,
                '_id.month': 1,
                '_id.type': 1,
              },
            },
          ],
        },
      },
    ]);

    // Process the faceted results for a clean response
    const results = summaryData[0];
    const totalIncome = results.summary.find((s) => s._id === 'income')?.total || 0;
    const totalExpense = results.summary.find((s) => s._id === 'expense')?.total || 0;
    const netIncome = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      summary: results.summary,
      categoryBreakdown: results.categoryBreakdown,
      monthlyTrends: results.monthlyTrends,
      netIncome: netIncome,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload receipt and extract data using Google Gemini
// @route   POST /api/transactions/upload-receipt
// @access  Private
exports.uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileStream = fs.createReadStream(filePath);

    // Initialize the Document Analysis Client
    const client = new DocumentAnalysisClient(
      process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY)
    );

    // Analyze the receipt
    const poller = await client.beginAnalyzeDocument("prebuilt-receipt", fileStream);
    const { documents: [receipt] } = await poller.pollUntilDone();

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    if (!receipt) {
      return res.status(400).json({ success: false, message: 'Could not analyze the receipt.' });
    }
console.log(receipt.fields);

    // Extract fields from the receipt
    const getField = (fieldName) => {
  const field = receipt.fields[fieldName];
  if (!field) return null;
  return field.value ?? field.content ?? null;
};


    const extractedData = {
      user: req.user.id, // link to the logged-in user
      type: 'expense',
      amount: parseFloat(getField('Total')) || 0,
      description: getField('MerchantName') || 'N/A',
      date: getField('TransactionDate') || new Date().toISOString().split('T')[0],
      category: 'Others',
    };

    res.status(201).json({
      success: true,
      data: extractedData,
    });

  } catch (err) {
    // Clean up the file if it still exists on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};