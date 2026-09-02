import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  type: 'inventory_alert' | 'system_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  state: 'unread' | 'read' | 'dismissed' | 'resolved';
  metadata?: any;
  targetRoles: string[]; // e.g., ['sales', 'operations', 'admin']
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    type: { type: String, required: true, default: 'inventory_alert' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    state: { type: String, enum: ['unread', 'read', 'dismissed', 'resolved'], default: 'unread', index: true },
    metadata: { type: Schema.Types.Mixed },
    targetRoles: [{ type: String }],
  },
  { timestamps: true }
);

notificationSchema.index({ storeId: 1, state: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
