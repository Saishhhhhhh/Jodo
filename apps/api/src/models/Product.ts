import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  status: 'draft' | 'active' | 'archived';
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  inventoryQuantity: number;
  category: string;
  vendor: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, index: true },
    barcode: { type: String },
    inventoryQuantity: { type: Number, default: 0 },
    category: { type: String, default: 'Uncategorized' },
    vendor: { type: String, default: '' },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Compound index to ensure slug is unique per store
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
