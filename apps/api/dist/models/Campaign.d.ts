import mongoose, { Document } from 'mongoose';
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
export declare const Campaign: mongoose.Model<any, {}, {}, {}, any, any>;
