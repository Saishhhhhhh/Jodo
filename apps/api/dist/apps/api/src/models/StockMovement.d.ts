import mongoose, { Document } from 'mongoose';
export interface IStockMovement extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    sku: string;
    movementType: 'Stock Added' | 'Stock Reduced' | 'Stock Reserved' | 'Reservation Released' | 'Order Confirmed' | 'Manual Adjustment';
    quantity: number;
    reference?: string;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const StockMovement: mongoose.Model<any, {}, {}, {}, any, any>;
