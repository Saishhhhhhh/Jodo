import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug: string;
  plan: 'starter' | 'growth' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  ownerUserId: mongoose.Types.ObjectId;
  billingEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'pro', 'enterprise'],
      default: 'starter',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active',
    },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    billingEmail: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

TenantSchema.index({ slug: 1 }, { unique: true });

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
