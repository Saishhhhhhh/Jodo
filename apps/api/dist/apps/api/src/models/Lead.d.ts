import mongoose, { Document } from 'mongoose';
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
    assignedTo?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Lead: mongoose.Model<any, {}, {}, {}, any, any>;
