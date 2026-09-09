import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IManufacturer extends Document {
  tenantId?: Types.ObjectId;
  name: string;
  location: string;
  contact: string;
  phone: string;
  email: string;
  activeOrders: number;
  rating: number;
  onTimeDeliveryRate: number;
  qualityRating: number;
  categories: string[];
  capacity: number;
  createdBy?: Types.ObjectId | string;
  updatedBy?: Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const manufacturerSchema = new Schema<IManufacturer>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    contact: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    activeOrders: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    onTimeDeliveryRate: { type: Number, default: 90, min: 0, max: 100 },
    qualityRating: { type: Number, default: 95, min: 0, max: 100 },
    categories: [{ type: String }],
    capacity: { type: Number, default: 5000 },
    createdBy: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Manufacturer =
  mongoose.models.Manufacturer || mongoose.model<IManufacturer>('Manufacturer', manufacturerSchema);
