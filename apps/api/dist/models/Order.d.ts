import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    productId?: mongoose.Types.ObjectId;
    sku: string;
    title: string;
    quantity: number;
    price: number;
    total: number;
}
export interface IShippingAddress {
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
export interface IFulfillment {
    carrier: string;
    trackingNumber: string;
    trackingUrl?: string;
    notifyCustomer: boolean;
    createdAt: Date;
}
export interface IRiskIndicator {
    indicator: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
}
export interface IOrder extends Document {
    tenantId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: IOrderItem[];
    shippingAddress?: IShippingAddress;
    fulfillments?: IFulfillment[];
    subtotal: number;
    taxTotal: number;
    shippingTotal: number;
    totalAmount: number;
    currency: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled' | 'returned';
    itemsCount: number;
    notes?: string;
    riskScore?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    riskIndicators?: IRiskIndicator[];
    fraudStatus?: 'under_review' | 'approved' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
    status: 'open' | 'archived' | 'cancelled' | 'draft';
}
export declare const Order: mongoose.Model<any, {}, {}, {}, any, any>;
