import Transaction from '../models/transaction';
import { Types } from 'mongoose';

const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    // Validation
    if (!type || !amount || !category || !description || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either income or expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim(),
      date: new Date(date)
    });

    await transaction.save();
    res.status(201).json({ 
      message: 'Transaction created successfully', 
      transaction 
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ 
      message: 'Error creating transaction', 
      error: error.message 
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };

    // Date filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Type filter
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      message: 'Error fetching transactions', 
      error: error.message 
    });
  }
};

const getTransactionsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let matchQuery = { userId: new Types.ObjectId(req.user._id) };

    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Summary by type
    const summary = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Category breakdown (expenses only)
    const categoryBreakdown = await Transaction.aggregate([
      { $match: { ...matchQuery, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly trends
    const monthlyTrends = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.type': 1 } }
    ]);

    // Calculate net income
    const incomeTotal = summary.find(s => s._id === 'income')?.total || 0;
    const expenseTotal = summary.find(s => s._id === 'expense')?.total || 0;
    const netIncome = incomeTotal - expenseTotal;

    res.json({
      summary,
      categoryBreakdown,
      monthlyTrends,
      netIncome,
      totalTransactions: summary.reduce((sum, s) => sum + s.count, 0)
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ 
      message: 'Error fetching summary', 
      error: error.message 
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ 
      message: 'Error deleting transaction', 
      error: error.message 
    });
  }
};

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Mock OCR/receipt parsing - in real app, use OCR service like Tesseract.js or Google Vision API
    const mockCategories = [
      'Food & Dining', 'Groceries', 'Transportation', 'Shopping', 
      'Entertainment', 'Healthcare', 'Gas Station', 'Restaurant'
    ];

    const extractedData = {
      amount: Math.floor(Math.random() * 100) + 10,
      category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
      description: `Receipt from ${req.file.originalname.split('.')[0]}`,
      date: new Date().toISOString().split('T')[0],
      receiptUrl: `/uploads/${req.file.filename}`
    };

    res.json({
      message: 'Receipt uploaded and processed successfully',
      extractedData,
      fileName: req.file.filename
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ 
      message: 'Error uploading receipt', 
      error: error.message 
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = [
      'Food & Dining',
      'Groceries',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Education',
      'Travel',
      'Investment',
      'Salary',
      'Freelance',
      'Business',
      'Gas',
      'Insurance',
      'Rent',
      'Other'
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};

export default {
  createTransaction,
  getTransactions,
  getTransactionsSummary,
  deleteTransaction,
  uploadReceipt,
  getCategories
};