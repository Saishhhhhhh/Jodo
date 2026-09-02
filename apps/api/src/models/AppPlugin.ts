import mongoose, { Schema, Document } from 'mongoose';

export interface IAppPlugin extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  developer: string;
  version: string;
  status: 'installed' | 'active' | 'error' | 'disabled';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const appPluginSchema = new Schema<IAppPlugin>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    developer: { type: String, required: true },
    version: { type: String, required: true },
    status: { type: String, enum: ['installed', 'active', 'error', 'disabled'], default: 'installed' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

appPluginSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const AppPlugin = mongoose.models.AppPlugin || mongoose.model<IAppPlugin>('AppPlugin', appPluginSchema);
