import mongoose, { Document, Schema, Types } from 'mongoose';

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

const warehouseSchema = new Schema<IWarehouse>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    capacity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Maintenance'],
      default: 'Active',
    },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Warehouse =
  mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', warehouseSchema);
