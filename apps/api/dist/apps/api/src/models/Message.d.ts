import mongoose, { Document, Types } from 'mongoose';
export interface IMessage extends Document {
    tenantId: Types.ObjectId;
    storeId: Types.ObjectId;
    sender: string;
    senderId?: Types.ObjectId;
    content: string;
    relatedModule?: 'Task' | 'Order' | 'Customer' | 'Return' | 'Product' | 'Complaint';
    relatedRecordId?: Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Message: mongoose.Model<any, {}, {}, {}, any, any>;
