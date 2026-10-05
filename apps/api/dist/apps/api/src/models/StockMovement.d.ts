import mongoose, { Document } from 'mongoose';
export interface IStockMovement extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    productId?: mongoose.Types.ObjectId;
    sku: string;
    movementType: 'Stock Added' | 'Stock Reduced' | 'Stock Reserved' | 'Reservation Released' | 'Order Confirmed' | 'Manual Adjustment';
    action?: 'ADD_STOCK' | 'REMOVE_STOCK' | 'SET_STOCK' | 'UPDATE_REORDER_LEVEL' | string;
    previousQuantity?: number;
    adjustmentQuantity?: number;
    newQuantity?: number;
    reason?: string;
    quantity: number;
    reference?: string;
    updatedBy?: mongoose.Types.ObjectId;
    adminName?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const StockMovement: mongoose.Model<any, {}, {}, {}, any, any>;
