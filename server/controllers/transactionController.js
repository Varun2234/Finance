const dotenv = require("dotenv");
dotenv.config();

const Transaction = require('../models/transaction');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");

// Get all transactions
exports.getTransactions = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', type, category, search } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const sort = `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
    const query = { user: req.user.id };

    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;
    if (search && search.trim() !== '') query.description = { $regex: search, $options: 'i' };

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query).sort(sort).skip((page - 1) * limit).limit(limit);

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

// Add transaction
exports.addTransaction = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const transaction = await Transaction.create(req.body);
    return res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// Update transaction
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, error: 'No transaction found' });
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, error: 'No transaction found' });
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }
    await transaction.deleteOne();
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// Get categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Transaction.find({ user: req.user.id }).distinct('category');
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// Get summary
exports.getSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { startDate, endDate } = req.query;

    const matchCriteria = { user: userId };
    if (startDate || endDate) {
      matchCriteria.date = {};
      if (startDate) matchCriteria.date.$gte = new Date(startDate);
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        matchCriteria.date.$lt = endOfDay;
      }
    }

    const summaryData = await Transaction.aggregate([
      { $match: matchCriteria },
      {
        $facet: {
          summary: [{ $group: { _id: '$type', total: { $sum: '$amount' } } }],
          categoryBreakdown: [
            { $match: { type: 'expense' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
          ],
          monthlyTrends: [
            { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.type': 1 } }
          ]
        }
      }
    ]);

    const results = summaryData[0];
    const totalIncome = results.summary.find(s => s._id === 'income')?.total || 0;
    const totalExpense = results.summary.find(s => s._id === 'expense')?.total || 0;
    const netIncome = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      summary: results.summary,
      categoryBreakdown: results.categoryBreakdown,
      monthlyTrends: results.monthlyTrends,
      netIncome
    });
  } catch (err) {
    next(err);
  }
};

// Upload receipt
exports.uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (!process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || !process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(500).json({ success: false, message: 'Azure credentials not configured.' });
    }

    const client = new DocumentAnalysisClient(
      process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY)
    );

    let analysisResult;
    try {
      if (fileExtension === '.pdf') {
        const fileBuffer = fs.readFileSync(filePath);
        const poller = await client.beginAnalyzeDocument("prebuilt-receipt", fileBuffer);
        analysisResult = await poller.pollUntilDone();
      } else {
        const fileStream = fs.createReadStream(filePath);
        const poller = await client.beginAnalyzeDocument("prebuilt-receipt", fileStream);
        analysisResult = await poller.pollUntilDone();
      }
    } catch (analysisError) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: `Failed to analyze: ${analysisError.message}` });
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const { documents } = analysisResult;
    const receipt = documents && documents[0];
    if (!receipt) return res.status(400).json({ success: false, message: 'Could not analyze the receipt.' });

    const getField = (fieldName) => {
      const field = receipt.fields && receipt.fields[fieldName];
      if (!field) return null;
      if (field.value !== undefined) return field.value;
      if (field.content !== undefined) return field.content;
      if (field.valueString !== undefined) return field.valueString;
      if (field.valueNumber !== undefined) return field.valueNumber;
      if (field.valueDate !== undefined) return field.valueDate;
      return null;
    };

    const totalAmount = getField('Total') || getField('TotalPrice') || 0;
    const merchantName = getField('MerchantName') || getField('Vendor') || 'Unknown Merchant';
    const transactionDate = getField('TransactionDate') || getField('Date') || new Date().toISOString().split('T')[0];

    let formattedDate = transactionDate;
    if (transactionDate instanceof Date) formattedDate = transactionDate.toISOString().split('T')[0];
    else if (typeof transactionDate === 'string') {
      const parsedDate = new Date(transactionDate);
      if (!isNaN(parsedDate.getTime())) formattedDate = parsedDate.toISOString().split('T')[0];
    }

    const extractedData = {
      user: req.user.id,
      type: 'expense',
      amount: parseFloat(totalAmount) || 0,
      description: merchantName || 'Receipt Transaction',
      date: formattedDate,
      category: 'Others'
    };

    res.status(201).json({
      success: true,
      data: extractedData,
      message: 'Receipt processed successfully.',
    });

  } catch (err) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(err);
  }
};
