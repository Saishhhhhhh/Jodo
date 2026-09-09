import mongoose, { Document, Types } from 'mongoose';
export interface IWarehouseIssue extends Document {
    tenantId?: Types.ObjectId;
    issueNumber: string;
    type: 'Production Delay' | 'Procurement Delay' | 'Quality Failure' | 'Stock Discrepancy' | 'Damaged Goods';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    relatedOrder: string;
    product: string;
    supplierManufacturer: string;
    issueDescription: string;
    reportedDate: Date;
    expectedResolution?: Date;
    assignedTo: string;
    status: 'Open' | 'Investigating' | 'Vendor Contacted' | 'Action Taken' | 'Resolved';
    resolutionNotes?: string;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WarehouseIssue: mongoose.Model<any, {}, {}, {}, any, any>;
