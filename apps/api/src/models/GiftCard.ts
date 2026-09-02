import mongoose, { Schema, Document } from 'mongoose';

export interface IGiftCard extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  code: string;
  initialValue: number;
  balance: number;
  expiryDate?: Date;
  recipientEmail?: string;
  note?: string;
  status: 'active' | 'disabled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const giftCardSchema = new Schema<IGiftCard>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    initialValue: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    recipientEmail: { type: String, lowercase: true, trim: true },
    note: { type: String },
    status: {
      type: String,
      enum: ['active', 'disabled', 'expired'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

giftCardSchema.index({ storeId: 1, code: 1 }, { unique: true });

export const GiftCard = mongoose.models.GiftCard || mongoose.model<IGiftCard>('GiftCard', giftCardSchema);
