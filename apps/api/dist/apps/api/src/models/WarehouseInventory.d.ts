import mongoose, { Document, Types } from 'mongoose';
export interface IWarehouseInventory extends Document {
    tenantId?: Types.ObjectId;
    warehouseId: Types.ObjectId | string;
    warehouseName: string;
    product: string;
    sku: string;
    stockInHand: number;
    reserved: number;
    available: number;
    incoming: number;
    reorderLevel: number;
    status: 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';
    lastUpdated: Date;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WarehouseInventory: mongoose.Model<any, {}, {}, {}, any, any>;
