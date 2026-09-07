import mongoose, { Document } from 'mongoose';
export interface IInventoryItem extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    sku: string;
    locationName: string;
    onHand: number;
    available: number;
    committed: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    reservedStock: number;
    reorderLevel: number;
    reorderQuantity: number;
    lastRestockedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InventoryItem: mongoose.Model<any, {}, {}, {}, any, any>;
