import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWarehouseInventory extends Document {
  tenantId?: Types.ObjectId;
  warehouseId: Types.ObjectId | string;
  warehouseName: string;
  product: string;
  sku: string;
  stockInHand: number;
  reserved: number;
  available: number;
  incoming: number;
  reorderLevel: number;
  status: 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';
  lastUpdated: Date;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseInventorySchema = new Schema<IWarehouseInventory>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    warehouseId: { type: Schema.Types.Mixed, required: true, index: true },
    warehouseName: { type: String, required: true },
    product: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    stockInHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0 },
    incoming: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 100, min: 0 },
    status: {
      type: String,
      enum: ['Healthy', 'Low Stock', 'Critical', 'Out of Stock'],
      default: 'Healthy',
    },
    lastUpdated: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

warehouseInventorySchema.index({ warehouseName: 1, sku: 1 }, { unique: true });

export const WarehouseInventory =
  mongoose.models.WarehouseInventory ||
  mongoose.model<IWarehouseInventory>('WarehouseInventory', warehouseInventorySchema);
