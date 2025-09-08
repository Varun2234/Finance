// Defines the schema for the Transaction model

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'], // Type must be either 'income' or 'expense'
    required: [true, 'Please specify a transaction type (income/expense)'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative number'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Please add some text'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
