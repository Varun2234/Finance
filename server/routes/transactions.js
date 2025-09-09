const express = require('express');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  uploadReceipt,
  getSummary, 
} = require('../controllers/transactionController');

const { validateTransaction, checkValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploads.jsx');

const router = express.Router();

router.use(protect);

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
