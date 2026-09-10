import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    type: 'inventory_alert' | 'system_alert';
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    state: 'unread' | 'read' | 'dismissed' | 'resolved';
    metadata?: any;
    targetRoles: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<any, {}, {}, {}, any, any>;
