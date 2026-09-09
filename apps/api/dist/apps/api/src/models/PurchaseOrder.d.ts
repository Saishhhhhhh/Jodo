import mongoose, { Document, Types } from 'mongoose';
export interface IPurchaseOrderItem {
    sku: string;
    name: string;
    qty: number;
    price: number;
}
export interface IPurchaseOrder extends Document {
    tenantId?: Types.ObjectId;
    poNumber: string;
    supplierId: Types.ObjectId | string;
    supplierName?: string;
    destinationWarehouse?: string;
    items: IPurchaseOrderItem[];
    totalAmount: number;
    status: 'Draft' | 'Sent' | 'In Production' | 'In Transit' | 'Received' | 'Partially Received' | 'Delayed' | 'Cancelled';
    expectedDate: Date;
    receivedDate?: Date;
    notes?: string;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PurchaseOrder: mongoose.Model<any, {}, {}, {}, any, any>;
