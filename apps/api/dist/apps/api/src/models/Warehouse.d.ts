import mongoose, { Document, Types } from 'mongoose';
export interface IWarehouse extends Document {
    tenantId?: Types.ObjectId;
    name: string;
    location: string;
    code: string;
    capacity: number;
    status: 'Active' | 'Inactive' | 'Under Maintenance';
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Warehouse: mongoose.Model<any, {}, {}, {}, any, any>;
