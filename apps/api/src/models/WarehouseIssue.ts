import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWarehouseIssue extends Document {
  tenantId?: Types.ObjectId;
  issueNumber: string;
  type:
    | 'Production Delay'
    | 'Procurement Delay'
    | 'Quality Failure'
    | 'Stock Discrepancy'
    | 'Damaged Goods';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  relatedOrder: string;
  product: string;
  supplierManufacturer: string;
  issueDescription: string;
  reportedDate: Date;
  expectedResolution?: Date;
  assignedTo: string;
  status: 'Open' | 'Investigating' | 'Vendor Contacted' | 'Action Taken' | 'Resolved';
  resolutionNotes?: string;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseIssueSchema = new Schema<IWarehouseIssue>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    issueNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: [
        'Production Delay',
        'Procurement Delay',
        'Quality Failure',
        'Stock Discrepancy',
        'Damaged Goods',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    relatedOrder: { type: String, required: true },
    product: { type: String, required: true },
    supplierManufacturer: { type: String, required: true },
    issueDescription: { type: String, required: true },
    reportedDate: { type: Date, default: Date.now },
    expectedResolution: { type: Date },
    assignedTo: { type: String, default: 'Warehouse Manager' },
    status: {
      type: String,
      enum: ['Open', 'Investigating', 'Vendor Contacted', 'Action Taken', 'Resolved'],
      default: 'Open',
    },
    resolutionNotes: { type: String },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const WarehouseIssue =
  mongoose.models.WarehouseIssue ||
  mongoose.model<IWarehouseIssue>('WarehouseIssue', warehouseIssueSchema);
