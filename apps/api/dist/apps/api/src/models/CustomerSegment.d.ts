import mongoose, { Document } from 'mongoose';
export interface ISegmentRule {
    field: 'totalSpent' | 'ordersCount' | 'status' | 'createdAt' | 'tags';
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne' | 'contains';
    value: any;
}
export interface ICustomerSegment extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    rules: ISegmentRule[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const CustomerSegment: mongoose.Model<any, {}, {}, {}, any, any>;
