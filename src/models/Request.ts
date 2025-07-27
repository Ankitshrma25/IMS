import mongoose from "mongoose";
import User from './User';

export interface IRequest extends mongoose.Document {
  requestNumber: string;
  requesterId: mongoose.Types.ObjectId;
  requesterName: string;
  requesterSection: string;
  requesterRank?: string;
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    itemName: string;
    serialNumber: string;
    category: string;
    quantity: number;
    unit: string;
    purpose: string;
    estimatedCost: number;
  }>;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "allocated"
    | "inTransit"
    | "completed"
    | "cancelled"
    | "forwardedToWSG"
    | "forwardedToCOD";
  priority: "low" | "medium" | "high" | "urgent";
  requestDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  currentLocation: "localStore" | "wsgStore" | "cod";
  sourceLocation: "localStore" | "wsgStore" | "cod";
  allocatedFrom?: "localStore" | "wsgStore" | "cod";
  allocationDate?: Date;
  allocatedBy?: mongoose.Types.ObjectId;
  notes: string;
  totalCost: number;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  consumptionLog: Array<{
    date: Date;
    itemId: mongoose.Types.ObjectId;
    itemName: string;
    quantity: number;
    purpose: string;
    location: string;
    performedBy: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const consumptionLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    purpose: { type: String, required: true },
    location: { type: String, required: true },
    performedBy: { type: String, required: true },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema<IRequest>(
  {
    requestNumber: {
      type: String,
      unique: true, // ✅ No "required"
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    requesterSection: {
      type: String,
      required: true,
    },
    requesterRank: {
      type: String,
      trim: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        itemName: { type: String, required: true },
        serialNumber: { type: String, required: true }, // ✅ Don't declare index here if done elsewhere
        category: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unit: { type: String, required: true },
        purpose: { type: String, required: true },
        estimatedCost: { type: Number, required: true, min: 0 },
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "allocated",
        "inTransit",
        "completed",
        "cancelled",
        "forwardedToWSG",
        "forwardedToCOD",
      ],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    requestDate: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    currentLocation: {
      type: String,
      enum: ["localStore", "wsgStore", "cod"],
      default: "localStore",
    },
    sourceLocation: {
      type: String,
      enum: ["localStore", "wsgStore", "cod"],
      required: true,
    },
    allocatedFrom: {
      type: String,
      enum: ["localStore", "wsgStore", "cod"],
    },
    allocationDate: { type: Date },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
    totalCost: { type: Number, default: 0 },
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    consumptionLog: { type: [consumptionLogSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Request ||
  mongoose.model<IRequest>("Request", requestSchema);
