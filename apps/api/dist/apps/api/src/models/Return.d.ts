import mongoose, { Document } from 'mongoose';
export interface IReturnItem {
    productId?: mongoose.Types.ObjectId;
    sku: string;
    title: string;
    quantity: number;
    price: number;
    reason: 'defective' | 'wrong_item' | 'did_not_like' | 'size_mismatch' | 'other';
}
export interface IReturn extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: IReturnItem[];
    status: 'requested' | 'approved' | 'received' | 'refunded' | 'rejected';
    refundAmount: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Return: mongoose.Model<any, {}, {}, {}, any, any>;
