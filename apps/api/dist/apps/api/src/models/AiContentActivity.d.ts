import mongoose, { Document } from 'mongoose';
export interface IAiContentActivity extends Document {
    activityId: string;
    contentId?: string;
    activity: string;
    user: string;
    type: 'generated' | 'edited' | 'reviewed' | 'approved' | 'published' | 'regenerated' | 'rejected';
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare const AiContentActivity: mongoose.Model<any, {}, {}, {}, any, any>;
