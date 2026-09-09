import mongoose, { Document, Types } from 'mongoose';
export interface IQualityCheck extends Document {
    tenantId?: Types.ObjectId;
    batchId: string;
    productionOrderId: Types.ObjectId | string;
    product: string;
    sku: string;
    manufacturer?: string;
    inspectedQty: number;
    passedQty: number;
    failedQty: number;
    defectType: 'None' | 'Stitching Defect' | 'Fabric Flaw' | 'Color Variation' | 'Measurement Deviation' | 'Packaging Damage' | 'Missing Label' | 'Other';
    defectNotes?: string;
    checkpoints: Record<string, string>;
    images: string[];
    inspector: string;
    status: 'Pending' | 'In Inspection' | 'Passed' | 'Partially Passed' | 'Failed' | 'Reinspection Required';
    date: Date;
    createdBy?: Types.ObjectId | string;
    updatedBy?: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const QualityCheck: mongoose.Model<any, {}, {}, {}, any, any>;
