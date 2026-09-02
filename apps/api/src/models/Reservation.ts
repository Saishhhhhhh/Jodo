import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  sku: string;
  referenceType: 'order' | 'quotation' | 'manual' | 'other';
  referenceId: string;
  reservedQuantity: number;
  status: 'active' | 'released' | 'converted' | 'expired';
  expiryDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, required: true },
    referenceType: {
      type: String,
      enum: ['order', 'quotation', 'manual', 'other'],
      required: true,
    },
    referenceId: { type: String, required: true },
    reservedQuantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['active', 'released', 'converted', 'expired'],
      default: 'active',
      index: true,
    },
    expiryDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Index for quickly finding reservations for a specific item
reservationSchema.index({ storeId: 1, sku: 1, status: 1 });

export const Reservation =
  mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', reservationSchema);
