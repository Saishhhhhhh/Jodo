import mongoose, { Schema, Document } from 'mongoose';

export interface IAiContentVersion extends Document {
  contentId: string;
  version: number;
  content: Record<string, any>;
  qualityScore?: number;
  modifiedBy: string;
  action: string;
  notes?: string;
  createdAt: Date;
}

const aiContentVersionSchema = new Schema<IAiContentVersion>(
  {
    contentId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    qualityScore: { type: Number },
    modifiedBy: { type: String, default: 'Admin' },
    action: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiContentVersionSchema.index({ contentId: 1, version: 1 }, { unique: true });

export const AiContentVersion =
  mongoose.models.AiContentVersion ||
  mongoose.model<IAiContentVersion>('AiContentVersion', aiContentVersionSchema);
