import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  source: 'Website' | 'Instagram' | 'WhatsApp' | 'Manual' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  interestLevel: 'High' | 'Medium' | 'Low';
  followUpPriority: 'High' | 'Medium' | 'Low';
  productRequirement?: string;
  budget?: string;
  location?: string;
  assignedTo?: string; // Could be a reference to Staff, but string for simplicity in v1
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    source: {
      type: String,
      enum: ['Website', 'Instagram', 'WhatsApp', 'Manual', 'Other'],
      default: 'Manual',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'],
      default: 'New',
    },
    interestLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    followUpPriority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    productRequirement: { type: String },
    budget: { type: String },
    location: { type: String },
    assignedTo: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for faster filtering on the CRM dashboard
leadSchema.index({ storeId: 1, status: 1 });
leadSchema.index({ storeId: 1, followUpPriority: 1 });

export const Lead = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
