import mongoose, { Document, Model, Schema } from "mongoose";

export interface IItem extends Document {
  name: string;
  category: string;
  quantity: number;
  description?: string;
  serialNumber?: string;
  location?: string;
  status: 'available' | 'deployed' | 'maintenance' | 'retired';
  lastModified: Date;
  lastModifiedBy: string;
}

const ItemSchema = new Schema<IItem>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: ''
  },
  serialNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  location: {
    type: String,
    default: 'Main Storage'
  },
  status: {
    type: String,
    enum: ['available', 'deployed', 'maintenance', 'retired'],
    default: 'available'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Item: Model<IItem> = 
  mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);