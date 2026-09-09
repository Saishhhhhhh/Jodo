import mongoose, { Schema, Document } from 'mongoose';

export type AiContentType = 'product_description' | 'catalogue_content' | 'listing_copy' | 'campaign_content';
export type AiContentStatus = 'Draft' | 'Pending Review' | 'Changes Requested' | 'Approved' | 'Published' | 'Rejected';

export interface IAiContent extends Document {
  contentId: string;
  tenantId?: mongoose.Types.ObjectId;
  storeId?: mongoose.Types.ObjectId;
  contentType: AiContentType;
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  sku?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  campaignId?: mongoose.Types.ObjectId;
  campaignName?: string;
  title: string;
  generatedContent: Record<string, any>;
  editedContent?: Record<string, any>;
  tone?: string;
  length?: string;
  channel?: string;
  targetAudience?: string;
  seoKeywords?: string[];
  seoOptimized?: boolean;
  qualityScore: number;
  qualityChecks: {
    grammar: boolean;
    brandTone: boolean;
    seo: boolean;
    productAccuracy: boolean;
    duplicateRisk: 'Low' | 'Medium' | 'High';
    unsupportedClaimsCount: number;
  };
  status: AiContentStatus;
  version: number;
  createdBy: string;
  submittedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  publishedBy?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  publishedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiContentSchema = new Schema<IAiContent>(
  {
    contentId: { type: String, required: true, unique: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store' },
    contentType: {
      type: String,
      enum: ['product_description', 'catalogue_content', 'listing_copy', 'campaign_content'],
      required: true,
      index: true,
    },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true },
    productName: { type: String },
    sku: { type: String },
    category: { type: String },
    price: { type: Number },
    imageUrl: { type: String },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    campaignName: { type: String },
    title: { type: String, required: true },
    generatedContent: { type: Schema.Types.Mixed, required: true },
    editedContent: { type: Schema.Types.Mixed },
    tone: { type: String, default: 'Luxury' },
    length: { type: String, default: 'Medium' },
    channel: { type: String, default: 'Website' },
    targetAudience: { type: String },
    seoKeywords: [{ type: String }],
    seoOptimized: { type: Boolean, default: true },
    qualityScore: { type: Number, default: 92, min: 0, max: 100 },
    qualityChecks: {
      grammar: { type: Boolean, default: true },
      brandTone: { type: Boolean, default: true },
      seo: { type: Boolean, default: true },
      productAccuracy: { type: Boolean, default: true },
      duplicateRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      unsupportedClaimsCount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['Draft', 'Pending Review', 'Changes Requested', 'Approved', 'Published', 'Rejected'],
      default: 'Draft',
      index: true,
    },
    version: { type: Number, default: 1 },
    createdBy: { type: String, default: 'Admin' },
    submittedBy: { type: String },
    reviewedBy: { type: String },
    approvedBy: { type: String },
    publishedBy: { type: String },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    publishedAt: { type: Date },
    reviewNotes: { type: String },
  },
  { timestamps: true }
);

export const AiContent = mongoose.models.AiContent || mongoose.model<IAiContent>('AiContent', aiContentSchema);
