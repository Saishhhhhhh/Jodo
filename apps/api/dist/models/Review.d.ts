import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    authorName: string;
    authorEmail: string;
    title?: string;
    body: string;
    status: 'approved' | 'pending' | 'spam';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: mongoose.Model<any, {}, {}, {}, any, any>;
