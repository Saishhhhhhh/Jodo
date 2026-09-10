import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWarehouseStockMovement extends Document {
  tenantId?: Types.ObjectId;
  inventoryId?: Types.ObjectId | string;
  sku: string;
  product: string;
  warehouse: string;
  date: Date;
  type:
    | 'PO Received'
    | 'Production Inward'
    | 'Order Fulfilment'
    | 'Damaged / Discarded'
    | 'Manual Adjustment'
    | 'Stock Transfer';
  quantity: number;
  balanceAfter: number;
  referenceId: string;
  performedBy: string;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseStockMovementSchema = new Schema<IWarehouseStockMovement>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    inventoryId: { type: Schema.Types.Mixed },
    sku: { type: String, required: true, index: true },
    product: { type: String, required: true },
    warehouse: { type: String, required: true },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: [
        'PO Received',
        'Production Inward',
        'Order Fulfilment',
        'Damaged / Discarded',
        'Manual Adjustment',
        'Stock Transfer',
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: String, required: true },
    performedBy: { type: String, default: 'Warehouse Manager' },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const WarehouseStockMovement =
  mongoose.models.WarehouseStockMovement ||
  mongoose.model<IWarehouseStockMovement>('WarehouseStockMovement', warehouseStockMovementSchema);
