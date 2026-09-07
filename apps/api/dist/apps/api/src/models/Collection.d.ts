import mongoose, { Document } from 'mongoose';
export interface ICollection extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    type: 'manual' | 'automated';
    products: mongoose.Types.ObjectId[];
    status: 'active' | 'draft' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Collection: mongoose.Model<any, {}, {}, {}, any, any>;
