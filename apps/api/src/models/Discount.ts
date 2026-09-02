import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscount extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  status: 'active' | 'scheduled' | 'expired';
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed_amount', 'free_shipping'], required: true },
    value: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'scheduled', 'expired'], default: 'active' },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

discountSchema.index({ storeId: 1, code: 1 }, { unique: true });

export const Discount = mongoose.models.Discount || mongoose.model<IDiscount>('Discount', discountSchema);
