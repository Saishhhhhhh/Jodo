import mongoose, { Document } from 'mongoose';
export interface IAutomation extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    trigger: string;
    action: string;
    status: 'active' | 'paused';
    executionCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Automation: mongoose.Model<any, {}, {}, {}, any, any>;
