import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductionOrder extends Document {
  tenantId?: Types.ObjectId;
  orderNumber: string;
  manufacturerId: Types.ObjectId | string;
  manufacturerName?: string;
  product: string;
  sku: string;
  quantity: number;
  completedQuantity: number;
  startDate: Date;
  targetDate: Date;
  status: 'Draft' | 'Planned' | 'In Production' | 'Delayed' | 'Completed' | 'Cancelled';
  stage:
    | 'Pattern Making'
    | 'Fabric Cutting'
    | 'Stitching & Assembly'
    | 'Printing / Embroidery'
    | 'Finishing & Ironing'
    | 'Final Packaging'
    | 'Ready for QC';
  delayReason?: string;
  progressPercentage: number;
  batchNumber?: string;
  destinationWarehouse?: string;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const productionOrderSchema = new Schema<IProductionOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    orderNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    manufacturerId: { type: Schema.Types.Mixed, required: true },
    manufacturerName: { type: String },
    product: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    completedQuantity: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    targetDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Planned', 'In Production', 'Delayed', 'Completed', 'Cancelled'],
      default: 'Planned',
    },
    stage: {
      type: String,
      enum: [
        'Pattern Making',
        'Fabric Cutting',
        'Stitching & Assembly',
        'Printing / Embroidery',
        'Finishing & Ironing',
        'Final Packaging',
        'Ready for QC',
      ],
      default: 'Pattern Making',
    },
    delayReason: { type: String },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    batchNumber: { type: String },
    destinationWarehouse: { type: String, default: 'Central Hub - BLR' },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ProductionOrder =
  mongoose.models.ProductionOrder || mongoose.model<IProductionOrder>('ProductionOrder', productionOrderSchema);
