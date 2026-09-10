import mongoose, { Document } from 'mongoose';
export interface ITenant extends Document {
    name: string;
    slug: string;
    plan: 'starter' | 'growth' | 'pro' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    ownerUserId: mongoose.Types.ObjectId;
    billingEmail: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Tenant: mongoose.Model<ITenant, {}, {}, {}, mongoose.Document<unknown, {}, ITenant, {}, {}> & ITenant & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
