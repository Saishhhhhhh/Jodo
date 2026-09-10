import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQualityCheck extends Document {
  tenantId?: Types.ObjectId;
  batchId: string;
  productionOrderId: Types.ObjectId | string;
  product: string;
  sku: string;
  manufacturer?: string;
  inspectedQty: number;
  passedQty: number;
  failedQty: number;
  defectType:
    | 'None'
    | 'Stitching Defect'
    | 'Fabric Flaw'
    | 'Color Variation'
    | 'Measurement Deviation'
    | 'Packaging Damage'
    | 'Missing Label'
    | 'Other';
  defectNotes?: string;
  checkpoints: Record<string, string>;
  images: string[];
  inspector: string;
  status: 'Pending' | 'In Inspection' | 'Passed' | 'Partially Passed' | 'Failed' | 'Reinspection Required';
  date: Date;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const qualityCheckSchema = new Schema<IQualityCheck>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    batchId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    productionOrderId: { type: Schema.Types.Mixed, required: true, index: true },
    product: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    manufacturer: { type: String },
    inspectedQty: { type: Number, required: true, min: 0 },
    passedQty: { type: Number, default: 0, min: 0 },
    failedQty: { type: Number, default: 0, min: 0 },
    defectType: {
      type: String,
      enum: [
        'None',
        'Stitching Defect',
        'Fabric Flaw',
        'Color Variation',
        'Measurement Deviation',
        'Packaging Damage',
        'Missing Label',
        'Other',
      ],
      default: 'None',
    },
    defectNotes: { type: String },
    checkpoints: { type: Schema.Types.Mixed, default: {} },
    images: [{ type: String }],
    inspector: { type: String, default: 'Senior QC Inspector' },
    status: {
      type: String,
      enum: [
        'Pending',
        'In Inspection',
        'Passed',
        'Partially Passed',
        'Failed',
        'Reinspection Required',
      ],
      default: 'Pending',
    },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const QualityCheck =
  mongoose.models.QualityCheck || mongoose.model<IQualityCheck>('QualityCheck', qualityCheckSchema);
