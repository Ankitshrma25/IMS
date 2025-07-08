// lib/models/Transaction.model.ts

// Mongoose
import mongoose, { Document, Model, Schema } from "mongoose";


// Define Transaction document interface
export interface ITransaction extends Document {
  itemId: Schema.Types.ObjectId;
  type: 'check-out' | 'check-in' | 'adjustment';
  quantity: number;
  performedBy: string;
  recipientName?: string;
  recipientUnit?: string;
  notes?: string;
  date: Date;
}


// Define transaction schema
const TransactionSchema = new Schema<ITransaction>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  type: {
    type: String,
    enum: ['check-out', 'check-in', 'adjustment'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  performedBy: {
    type: String,
    required: true
  },
  recipientName: String,
  recipientUnit: String,
  notes: String,
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const Transaction: Model<ITransaction> = 
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);