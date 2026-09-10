import mongoose, { Document } from 'mongoose';
export interface IAiContentVersion extends Document {
    contentId: string;
    version: number;
    content: Record<string, any>;
    qualityScore?: number;
    modifiedBy: string;
    action: string;
    notes?: string;
    createdAt: Date;
}
export declare const AiContentVersion: mongoose.Model<any, {}, {}, {}, any, any>;
