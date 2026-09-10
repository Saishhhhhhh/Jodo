import mongoose, { Document } from 'mongoose';
export interface ICustomerAddress {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
}
export interface ICustomer extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    ordersCount: number;
    totalSpent: number;
    loyaltyPoints: number;
    walletBalance: number;
    status: 'active' | 'inactive';
    tags?: string[];
    passwordHash?: string;
    defaultShippingAddress?: ICustomerAddress;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
export declare const Customer: mongoose.Model<any, {}, {}, {}, any, any>;
