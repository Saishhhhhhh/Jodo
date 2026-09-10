import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISupplier extends Document {
  tenantId?: Types.ObjectId;
  name: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  rating: number;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Supplier =
  mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', supplierSchema);
