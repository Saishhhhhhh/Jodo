import mongoose, { Document, Types } from 'mongoose';
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
export declare const Manufacturer: mongoose.Model<any, {}, {}, {}, any, any>;
