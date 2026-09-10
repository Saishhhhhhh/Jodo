import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFulfilmentConditions {
  stockAvailable: boolean;
  stockReserved: boolean;
  productionCompleted: boolean;
  qcPassed: boolean;
  packagingReady: boolean;
  dispatchPrepared: boolean;
}

export interface IFulfilmentReadiness extends Document {
  tenantId?: Types.ObjectId;
  orderId: string;
  customer: string;
  channel: string;
  product: string;
  sku: string;
  quantity: number;
  requiredDate: Date;
  readinessScore: number;
  conditions: IFulfilmentConditions;
  status:
    | 'Ready for Fulfilment'
    | 'Almost Ready'
    | 'Partially Ready'
    | 'At Risk'
    | 'Not Ready'
    | 'Dispatched';
  warehouse: string;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const fulfilmentReadinessSchema = new Schema<IFulfilmentReadiness>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    orderId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customer: { type: String, required: true },
    channel: { type: String, default: 'Online Store' },
    product: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    requiredDate: { type: Date, required: true },
    readinessScore: { type: Number, default: 0, min: 0, max: 100 },
    conditions: {
      stockAvailable: { type: Boolean, default: false },
      stockReserved: { type: Boolean, default: false },
      productionCompleted: { type: Boolean, default: false },
      qcPassed: { type: Boolean, default: false },
      packagingReady: { type: Boolean, default: false },
      dispatchPrepared: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: [
        'Ready for Fulfilment',
        'Almost Ready',
        'Partially Ready',
        'At Risk',
        'Not Ready',
        'Dispatched',
      ],
      default: 'Not Ready',
    },
    warehouse: { type: String, default: 'Central Hub - BLR' },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const FulfilmentReadiness =
  mongoose.models.FulfilmentReadiness ||
  mongoose.model<IFulfilmentReadiness>('FulfilmentReadiness', fulfilmentReadinessSchema);
