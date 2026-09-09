import mongoose, { Document, Types } from 'mongoose';
export interface IWarehouseStockMovement extends Document {
    tenantId?: Types.ObjectId;
    inventoryId?: Types.ObjectId | string;
    sku: string;
    product: string;
    warehouse: string;
    date: Date;
    type: 'PO Received' | 'Production Inward' | 'Order Fulfilment' | 'Damaged / Discarded' | 'Manual Adjustment' | 'Stock Transfer';
    quantity: number;
    balanceAfter: number;
    referenceId: string;
    performedBy: string;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WarehouseStockMovement: mongoose.Model<any, {}, {}, {}, any, any>;
