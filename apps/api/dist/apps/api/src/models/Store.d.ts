import mongoose, { Document } from 'mongoose';
export interface IStore extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    primaryDomain?: string;
    defaultCurrency: string;
    defaultCountry: string;
    timezone: string;
    status: 'active' | 'paused' | 'archived';
    settings: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Store: mongoose.Model<IStore, {}, {}, {}, mongoose.Document<unknown, {}, IStore, {}, {}> & IStore & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
