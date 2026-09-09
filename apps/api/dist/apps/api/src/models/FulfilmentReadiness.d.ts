import mongoose, { Document, Types } from 'mongoose';
export interface IFulfilmentConditions {
    stockAvailable: boolean;
    stockReserved: boolean;
    productionCompleted: boolean;
    qcPassed: boolean;
    packagingReady: boolean;
    dispatchPrepared: boolean;
}
export interface IFulfilmentReadiness extends Document {
    tenantId?: Types.ObjectId;
    orderId: string;
    customer: string;
    channel: string;
    product: string;
    sku: string;
    quantity: number;
    requiredDate: Date;
    readinessScore: number;
    conditions: IFulfilmentConditions;
    status: 'Ready for Fulfilment' | 'Almost Ready' | 'Partially Ready' | 'At Risk' | 'Not Ready' | 'Dispatched';
    warehouse: string;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FulfilmentReadiness: mongoose.Model<any, {}, {}, {}, any, any>;
