import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  category: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  date: { 
    type: Date, 
    required: true 
  },
  receiptUrl: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

export default model('Transaction', transactionSchema);