import mongoose, { Document } from 'mongoose';
export interface IReservation extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    sku: string;
    referenceType: 'order' | 'quotation' | 'manual' | 'other';
    referenceId: string;
    reservedQuantity: number;
    status: 'active' | 'released' | 'converted' | 'expired';
    expiryDate?: Date;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Reservation: mongoose.Model<any, {}, {}, {}, any, any>;
