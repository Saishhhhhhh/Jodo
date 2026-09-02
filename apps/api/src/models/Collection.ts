import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  type: 'manual' | 'automated';
  products: mongoose.Types.ObjectId[];
  status: 'active' | 'draft' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    type: {
      type: String,
      enum: ['manual', 'automated'],
      default: 'manual',
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'draft',
      index: true,
    },
  },
  { timestamps: true }
);

collectionSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export const Collection = mongoose.models.Collection || mongoose.model<ICollection>('Collection', collectionSchema);
