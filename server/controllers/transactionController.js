const dotenv = require("dotenv");
dotenv.config();

const Transaction = require('../models/transaction');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
// @access  Private


// @desc    Get all transactions (with pagination)
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    // Extract query parameters for pagination, sorting and filtering
    let { page = 1, limit = 10, sort = '-date' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Base query: only the logged-in user’s transactions
    const query = { user: req.user.id };

    // Count total transactions (for pagination info)
    const total = await Transaction.countDocuments(query);

    // Fetch transactions with pagination + sorting
    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      page,
      pages: Math.ceil(total / limit),
      total,
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
// @desc    Upload receipt and extract data using Azure Document Intelligence
// @route   POST /api/transactions/upload-receipt
// @access  Private
exports.uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    console.log(`Processing file: ${req.file.originalname}, type: ${req.file.mimetype}, size: ${req.file.size} bytes`);

    // Check if we have the required Azure credentials
    if (!process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || !process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY) {
      // Clean up the uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(500).json({ 
        success: false, 
        message: 'Azure Document Intelligence credentials not configured.' 
      });
    }

    // Initialize the Document Analysis Client
    const client = new DocumentAnalysisClient(
      process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY)
    );

    let analysisResult;

    try {
      // For PDF files, we need to read as buffer
      if (fileExtension === '.pdf') {
        const fileBuffer = fs.readFileSync(filePath);
        const poller = await client.beginAnalyzeDocument("prebuilt-receipt", fileBuffer);
        analysisResult = await poller.pollUntilDone();
      } else {
        // For image files, we can use stream
        const fileStream = fs.createReadStream(filePath);
        const poller = await client.beginAnalyzeDocument("prebuilt-receipt", fileStream);
        analysisResult = await poller.pollUntilDone();
      }
    } catch (analysisError) {
      console.error('Azure Document Intelligence error:', analysisError);
      // Clean up the uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ 
        success: false, 
        message: `Failed to analyze the document: ${analysisError.message}` 
      });
    }

    // Clean up the uploaded file after processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const { documents } = analysisResult;
    const receipt = documents && documents[0];

    if (!receipt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not analyze the receipt. Please ensure the file contains a valid receipt.' 
      });
    }

    console.log('Receipt fields found:', Object.keys(receipt.fields || {}));

    // Extract fields from the receipt with better error handling
    const getField = (fieldName) => {
      const field = receipt.fields && receipt.fields[fieldName];
      if (!field) return null;
      
      // Handle different field types
      if (field.value !== undefined) {
        return field.value;
      } else if (field.content !== undefined) {
        return field.content;
      } else if (field.valueString !== undefined) {
        return field.valueString;
      } else if (field.valueNumber !== undefined) {
        return field.valueNumber;
      } else if (field.valueDate !== undefined) {
        return field.valueDate;
      }
      
      return null;
    };

    // Extract and format the data
    const totalAmount = getField('Total') || getField('TotalPrice') || 0;
    const merchantName = getField('MerchantName') || getField('Vendor') || 'Unknown Merchant';
    const transactionDate = getField('TransactionDate') || getField('Date') || new Date().toISOString().split('T')[0];
    
    // Convert date to proper format if it's a Date object
    let formattedDate = transactionDate;
    if (transactionDate instanceof Date) {
      formattedDate = transactionDate.toISOString().split('T')[0];
    } else if (typeof transactionDate === 'string') {
      // Try to parse the date string and format it
      const parsedDate = new Date(transactionDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toISOString().split('T')[0];
      }
    }

    const extractedData = {
      user: req.user.id,
      type: 'expense',
      amount: parseFloat(totalAmount) || 0,
      description: merchantName || 'Receipt Transaction',
      date: formattedDate,
      category: 'Others', // Default category
    };

    console.log('Extracted data:', extractedData);

    res.status(201).json({
      success: true,
      data: extractedData,
      message: 'Receipt processed successfully. Please review the extracted information.',
    });

  } catch (err) {
    console.error('Upload receipt error:', err);
    
    // Clean up the file if it still exists on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    next(err);
  }
};