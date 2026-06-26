import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  sku: string;
  locationName: string;
  onHand: number;
  available: number;
  committed: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

const inventoryItemSchema = new Schema<IInventoryItem>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    sku: { type: String, required: true },
    locationName: { type: String, required: true },
    onHand: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    committed: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'out_of_stock',
    },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ storeId: 1, sku: 1, locationName: 1 }, { unique: true });

export const InventoryItem =
  mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', inventoryItemSchema);
