import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
require('dotenv').config();

// Import routes
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(json());
// app.use('/uploads');

// MongoDB connection
connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-finance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;