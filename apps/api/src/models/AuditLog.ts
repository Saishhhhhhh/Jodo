import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  actorUserId?: mongoose.Types.ObjectId;
  actorType: 'user' | 'system' | 'api_key' | 'plugin';
  action: string;
  resourceType: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorType: {
      type: String,
      enum: ['user', 'system', 'api_key', 'plugin'],
      required: true,
    },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // immutable, no updatedAt
  }
);

// Audit logs are immutable - disable updates
AuditLogSchema.set('strict', true);

AuditLogSchema.index({ tenantId: 1, storeId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, actorUserId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, resourceType: 1, resourceId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
