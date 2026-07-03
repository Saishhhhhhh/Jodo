import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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

const customerSchema = new Schema<ICustomer>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    ordersCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    tags: { type: [String], default: [] },
    passwordHash: { type: String, select: false },
    defaultShippingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      address1: { type: String },
      address2: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String },
      phone: { type: String },
    }
  },
  { timestamps: true }
);

customerSchema.index({ storeId: 1, email: 1 }, { unique: true });

// Hash password before save
customerSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
customerSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
