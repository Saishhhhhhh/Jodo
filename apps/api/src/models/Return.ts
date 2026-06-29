import mongoose, { Schema, Document } from 'mongoose';

export interface IReturnItem {
  productId?: mongoose.Types.ObjectId;
  sku: string;
  title: string;
  quantity: number;
  price: number;
  reason: 'defective' | 'wrong_item' | 'did_not_like' | 'size_mismatch' | 'other';
}

export interface IReturn extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  customerName: string;
  customerEmail: string;

  items: IReturnItem[];
  status: 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
  refundAmount: number;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const returnItemSchema = new Schema<IReturnItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  sku: { type: String, required: true },
  title: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['defective', 'wrong_item', 'did_not_like', 'size_mismatch', 'other'],
    required: true,
  },
});

const returnSchema = new Schema<IReturn>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },

    items: [returnItemSchema],
    status: {
      type: String,
      enum: ['requested', 'approved', 'received', 'refunded', 'rejected'],
      default: 'requested',
    },
    refundAmount: { type: Number, required: true, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Return = mongoose.models.Return || mongoose.model<IReturn>('Returns', returnSchema);
