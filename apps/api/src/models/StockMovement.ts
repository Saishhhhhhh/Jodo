import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  sku: string;
  movementType: 'Stock Added' | 'Stock Reduced' | 'Stock Reserved' | 'Reservation Released' | 'Order Confirmed' | 'Manual Adjustment';
  quantity: number;
  reference?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    sku: { type: String, required: true, index: true },
    movementType: {
      type: String,
      enum: ['Stock Added', 'Stock Reduced', 'Stock Reserved', 'Reservation Released', 'Order Confirmed', 'Manual Adjustment'],
      required: true,
    },
    quantity: { type: Number, required: true },
    reference: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Index for recent stock movements of a store
stockMovementSchema.index({ storeId: 1, createdAt: -1 });

export const StockMovement =
  mongoose.models.StockMovement || mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
