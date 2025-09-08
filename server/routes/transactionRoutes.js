import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { createTransaction, getTransactions, getTransactionsSummary, deleteTransaction, uploadReceipt, getCategories } from '../controllers/transactionController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Transaction routes
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/summary', getTransactionsSummary);
router.delete('/:id', deleteTransaction);
router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);

// Category routes
router.get('/categories', getCategories);

export default router;