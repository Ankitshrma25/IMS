import mongoose from 'mongoose';

export interface IItem extends mongoose.Document {
  itemName: string;
  description?: string; // Make optional
  category: 'ORDNANCE' | 'DGEME' | 'PMSE' | 'TTG';
  serialNumber: string;
  conditionStatus: 'serviceable' | 'unserviceable' | 'OBT' | 'OBE';
  location: 'localStore' | 'wsgStore' | 'cod';
  stockLevel: number;
  unit: string;
  supplier: string;
  dateReceived: Date;
  lastIssued?: Date;
  minStockLevel: number;
  leadTime: number; // in days
  calibrationSchedule?: Date;
  expirationDate?: Date;
  section?: string;
  cost: number;
  isActive: boolean;
  transactionHistory: Array<{
    date: Date;
    type: 'received' | 'issued' | 'returned' | 'damaged' | 'calibrated';
    quantity: number;
    reference: string;
    notes?: string;
    performedBy: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['received', 'issued', 'returned', 'damaged', 'calibrated'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  performedBy: {
    type: String,
    required: true,
  },
}, { _id: false });

const itemSchema = new mongoose.Schema<IItem>({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    // required: true, // Make optional
  },
  category: {
    type: String,
    required: true,
    enum: ['ORDNANCE', 'DGEME', 'PMSE', 'TTG'],
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  conditionStatus: {
    type: String,
    required: true,
    enum: ['serviceable', 'unserviceable', 'OBT', 'OBE'],
    default: 'serviceable',
  },
  location: {
    type: String,
    required: true,
    enum: ['localStore', 'wsgStore', 'cod'],
  },
  stockLevel: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: ['Pieces', 'Kilos', 'Liters', 'Meters', 'Boxes', 'Sets', 'Units'],
  },
  supplier: {
    type: String,
    required: true,
    trim: true,
  },
  dateReceived: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lastIssued: {
    type: Date,
  },
  minStockLevel: {
    type: Number,
    required: true,
    min: 0,
  },
  leadTime: {
    type: Number,
    required: true,
    min: 0,
    default: 30, // default 30 days
  },
  calibrationSchedule: {
    type: Date,
  },
  expirationDate: {
    type: Date,
  },
  section: {
    type: String,
    required: function() {
      return this.location === 'localStore';
    },
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  transactionHistory: {
    type: [transactionHistorySchema],
    default: [],
  },
}, {
  timestamps: true,
});

// Index for efficient queries
itemSchema.index({ category: 1, location: 1 });
itemSchema.index({ serialNumber: 1 });
itemSchema.index({ conditionStatus: 1 });
itemSchema.index({ expirationDate: 1 });
itemSchema.index({ calibrationSchedule: 1 });

// Virtual for stock status
itemSchema.virtual('stockStatus').get(function() {
  if (this.stockLevel === 0) return 'out_of_stock';
  if (this.stockLevel <= this.minStockLevel) return 'low_stock';
  return 'in_stock';
});

// Method to add transaction to history
itemSchema.methods.addTransaction = function(transaction: {
  type: 'received' | 'issued' | 'returned' | 'damaged' | 'calibrated';
  quantity: number;
  reference: string;
  notes?: string;
  performedBy: string;
}) {
  this.transactionHistory.push({
    date: new Date(),
    ...transaction,
  });
  return this.save();
};

// Method to update stock level
itemSchema.methods.updateStock = function(quantity: number, type: 'received' | 'issued' | 'returned' | 'damaged') {
  if (type === 'received' || type === 'returned') {
    this.stockLevel += quantity;
  } else {
    this.stockLevel = Math.max(0, this.stockLevel - quantity);
  }
  
  if (type === 'issued') {
    this.lastIssued = new Date();
  }
  
  return this.save();
};

export default mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema); 