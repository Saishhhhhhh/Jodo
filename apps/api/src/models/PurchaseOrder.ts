import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPurchaseOrderItem {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface IPurchaseOrder extends Document {
  tenantId?: Types.ObjectId;
  poNumber: string;
  supplierId: Types.ObjectId | string;
  supplierName?: string;
  destinationWarehouse?: string;
  items: IPurchaseOrderItem[];
  totalAmount: number;
  status:
    | 'Draft'
    | 'Sent'
    | 'In Production'
    | 'In Transit'
    | 'Received'
    | 'Partially Received'
    | 'Delayed'
    | 'Cancelled';
  expectedDate: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    poNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    supplierId: { type: Schema.Types.Mixed, required: true },
    supplierName: { type: String },
    destinationWarehouse: { type: String, default: 'Central Hub - BLR' },
    items: [purchaseOrderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        'Draft',
        'Sent',
        'In Production',
        'In Transit',
        'Received',
        'Partially Received',
        'Delayed',
        'Cancelled',
      ],
      default: 'Sent',
    },
    expectedDate: { type: Date, required: true },
    receivedDate: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const PurchaseOrder =
  mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);
