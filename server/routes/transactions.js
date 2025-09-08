// Defines the API routes for handling transactions

const express = require('express');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
  getSummary, // <-- IMPORT ADDED
} = require('../controllers/transactionController');

const { validateTransaction, checkValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All transaction routes are protected and require authentication.
// This middleware will be applied to all routes defined below in this file.
router.use(protect);

// THESE ROUTES MUST BE BEFORE /:id
router.route('/categories').get(getCategories);
router.route('/summary').get(getSummary); // <-- ROUTE ADDED

router
  .route('/')
  .get(getTransactions)
  .post(validateTransaction, checkValidation, addTransaction);

router
  .route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;