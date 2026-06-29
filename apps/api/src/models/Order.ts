import mongoose, { Schema, Document } from 'mongoose';

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
  
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  sku: { type: String, required: true },
  title: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
});

const fulfillmentSchema = new Schema<IFulfillment>({
  carrier: { type: String, required: true },
  trackingNumber: { type: String, required: true },
  trackingUrl: { type: String },
  notifyCustomer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const orderSchema = new Schema<IOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    fulfillments: [fulfillmentSchema],
    
    subtotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, required: true, default: 0 },
    shippingTotal: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    fulfillmentStatus: {
      type: String,
      enum: ['unfulfilled', 'partial', 'fulfilled', 'returned'],
      default: 'unfulfilled',
    },
    itemsCount: { type: Number, required: true, min: 1 },
    
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ storeId: 1, orderNumber: 1 }, { unique: true });

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
