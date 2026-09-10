import mongoose, { Document, Types } from 'mongoose';
export interface ISupplier extends Document {
    tenantId?: Types.ObjectId;
    name: string;
    contact: string;
    email: string;
    phone: string;
    category: string;
    rating: number;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Supplier: mongoose.Model<any, {}, {}, {}, any, any>;
