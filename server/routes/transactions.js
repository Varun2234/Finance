// Defines the API routes for handling transactions

const express = require('express');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  // *** MODIFICATION: Removed getCategories ***
  uploadReceipt,
  getSummary, 
} = require('../controllers/transactionController');

const { validateTransaction, checkValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploads.jsx');

const router = express.Router();

// All transaction routes are protected and require authentication.
// This middleware will be applied to all routes defined below in this file.
router.use(protect);

// THESE ROUTES MUST BE BEFORE /:id
// *** MODIFICATION: Removed the /categories route ***
router.route('/summary').get(getSummary); 

router.route('/upload-receipt').post(upload, uploadReceipt); 

router
  .route('/')
  .get(getTransactions)
  .post(validateTransaction, checkValidation, addTransaction);

router
  .route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;