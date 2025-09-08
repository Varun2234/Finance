const dotenv = require("dotenv");
dotenv.config();
const Transaction = require('../models/transaction');
const mongoose = require('mongoose'); // Import mongoose to use ObjectId
const OpenAI = require('openai'); // <-- 1. ADD THIS
const fs = require('fs');         // <-- 2. ADD THIS
const mime = require('mime-types');
// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
// @access  Private
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
exports.getTransactions = async (req, res, next) => {
  try {
    // Fetch transactions belonging to the user, sorted by date descending
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

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

    // 1. Build the base match stage
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

    // 2. Use $facet to run multiple aggregations in parallel
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

    // 3. Process the faceted results for a clean response
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
exports.uploadReceipt = async (req, res, next) => {
  try {
    // 1. Check if file exists (from Multer middleware in 'uploads.jsx')
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = req.file.path;

    // 2. Read the file and convert it to Base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    // 3. Define the prompt for the AI
    const promptText = `
      You are an expert expense tracker. Analyze this receipt image and return ONLY a valid JSON object 
      with the following properties:
      1. "type": This should always be "expense".
      2. "amount": The final total amount paid (as a number, not a string).
      3. "description": A short description or the name of the merchant (e.g., "Starbucks", "Target Purchase").
      4. "date": The date of the transaction in YYYY-MM-DD format. If no date is found, use today's date: ${new Date().toISOString().split('T')[0]}.
      
      If you cannot determine a value, make a reasonable guess or use null. Return only the JSON object and nothing else.
    `;

    // 4. Send the request to OpenAI (using the model from your sample)
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o as it's the latest and best for vision
      response_format: { type: "json_object" }, // Ensures the output is valid JSON
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    // 5. Clean up the uploaded file (optional, but good practice)
    fs.unlinkSync(filePath); 

    // 6. Send the extracted data back to the client
    const extractedData = JSON.parse(response.choices[0].message.content);

    res.status(200).json({
      success: true,
      extractedData: extractedData,
    });

  } catch (err) {
    // Clean up the file even if AI analysis fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    next(err); // Pass to your global error handler
  }
};