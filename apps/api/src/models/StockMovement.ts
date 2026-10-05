import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovement extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  sku: string;
  movementType: 'Stock Added' | 'Stock Reduced' | 'Stock Reserved' | 'Reservation Released' | 'Order Confirmed' | 'Manual Adjustment';
  action?: 'ADD_STOCK' | 'REMOVE_STOCK' | 'SET_STOCK' | 'UPDATE_REORDER_LEVEL' | string;
  previousQuantity?: number;
  adjustmentQuantity?: number;
  newQuantity?: number;
  reason?: string;
  quantity: number;
  reference?: string;
  updatedBy?: mongoose.Types.ObjectId;
  adminName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    sku: { type: String, required: true, index: true },
    movementType: {
      type: String,
      enum: ['Stock Added', 'Stock Reduced', 'Stock Reserved', 'Reservation Released', 'Order Confirmed', 'Manual Adjustment'],
      required: true,
    },
    action: { type: String },
    previousQuantity: { type: Number },
    adjustmentQuantity: { type: Number },
    newQuantity: { type: Number },
    reason: { type: String },
    quantity: { type: Number, required: true },
    reference: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    adminName: { type: String },
  },
  { timestamps: true }
);

// Index for recent stock movements of a store
stockMovementSchema.index({ storeId: 1, createdAt: -1 });

export const StockMovement =
  mongoose.models.StockMovement || mongoose.model<IStockMovement>('StockMovement', stockMovementSchema);
