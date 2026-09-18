import mongoose, { Document } from 'mongoose';
export interface IGiftCard extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    code: string;
    initialValue: number;
    balance: number;
    expiryDate?: Date;
    recipientEmail?: string;
    note?: string;
    status: 'active' | 'disabled' | 'expired';
    createdAt: Date;
    updatedAt: Date;
}
export declare const GiftCard: mongoose.Model<any, {}, {}, {}, any, any>;
