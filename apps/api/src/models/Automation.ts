import mongoose, { Schema, Document } from 'mongoose';

export interface IAutomation extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused';
  executionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const automationSchema = new Schema<IAutomation>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    trigger: { type: String, required: true },
    action: { type: String, required: true },
    status: { type: String, enum: ['active', 'paused'], default: 'paused' },
    executionCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Automation = mongoose.models.Automation || mongoose.model<IAutomation>('Automation', automationSchema);
