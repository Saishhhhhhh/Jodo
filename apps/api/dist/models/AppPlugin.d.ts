import mongoose, { Document } from 'mongoose';
export interface IAppPlugin extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    name: string;
    developer: string;
    version: string;
    status: 'installed' | 'active' | 'error' | 'disabled';
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AppPlugin: mongoose.Model<any, {}, {}, {}, any, any>;
