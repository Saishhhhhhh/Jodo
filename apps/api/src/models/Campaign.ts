import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  budget?: number;
  spend: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['email', 'sms', 'push', 'whatsapp'], required: true },
    status: { type: String, enum: ['draft', 'scheduled', 'active', 'completed'], default: 'draft' },
    budget: { type: Number, min: 0 },
    spend: { type: Number, default: 0, min: 0 },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export const Campaign = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', campaignSchema);
