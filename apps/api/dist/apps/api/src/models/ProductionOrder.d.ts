import mongoose, { Document, Types } from 'mongoose';
export interface IProductionOrder extends Document {
    tenantId?: Types.ObjectId;
    orderNumber: string;
    manufacturerId: Types.ObjectId | string;
    manufacturerName?: string;
    product: string;
    sku: string;
    quantity: number;
    completedQuantity: number;
    startDate: Date;
    targetDate: Date;
    status: 'Draft' | 'Planned' | 'In Production' | 'Delayed' | 'Completed' | 'Cancelled';
    stage: 'Pattern Making' | 'Fabric Cutting' | 'Stitching & Assembly' | 'Printing / Embroidery' | 'Finishing & Ironing' | 'Final Packaging' | 'Ready for QC';
    delayReason?: string;
    progressPercentage: number;
    batchNumber?: string;
    destinationWarehouse?: string;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProductionOrder: mongoose.Model<any, {}, {}, {}, any, any>;
