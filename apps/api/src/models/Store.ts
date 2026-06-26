import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  primaryDomain?: string;
  defaultCurrency: string;
  defaultCountry: string;
  timezone: string;
  status: 'active' | 'paused' | 'archived';
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    primaryDomain: { type: String, trim: true },
    defaultCurrency: { type: String, default: 'INR', uppercase: true },
    defaultCountry: { type: String, default: 'IN', uppercase: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    status: {
      type: String,
      enum: ['active', 'paused', 'archived'],
      default: 'active',
    },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

StoreSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const Store = mongoose.model<IStore>('Store', StoreSchema);
