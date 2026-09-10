import mongoose, { Document } from 'mongoose';
export interface IDiscount extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    code: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    status: 'active' | 'scheduled' | 'expired';
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Discount: mongoose.Model<any, {}, {}, {}, any, any>;
