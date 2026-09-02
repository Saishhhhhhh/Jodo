import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  rating: number;
  authorName: string;
  authorEmail: string;
  title?: string;
  body: string;
  status: 'approved' | 'pending' | 'spam';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, trim: true },
    body: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['approved', 'pending', 'spam'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
