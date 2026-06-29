import mongoose, { Schema, Document } from 'mongoose';

export interface ISegmentRule {
  field: 'totalSpent' | 'ordersCount' | 'status' | 'createdAt';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'ne';
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

const segmentRuleSchema = new Schema<ISegmentRule>({
  field: { 
    type: String, 
    enum: ['totalSpent', 'ordersCount', 'status', 'createdAt'], 
    required: true 
  },
  operator: { 
    type: String, 
    enum: ['gt', 'lt', 'eq', 'gte', 'lte', 'ne'], 
    required: true 
  },
  value: { type: Schema.Types.Mixed, required: true },
});

const customerSegmentSchema = new Schema<ICustomerSegment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    rules: [segmentRuleSchema],
  },
  { timestamps: true }
);

customerSegmentSchema.index({ storeId: 1, name: 1 }, { unique: true });

export const CustomerSegment = mongoose.models.CustomerSegment || mongoose.model<ICustomerSegment>('CustomerSegment', customerSegmentSchema);
