import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  avatarUrl?: string;
  status: 'active' | 'invited' | 'suspended' | 'deactivated';
  roleIds: mongoose.Types.ObjectId[];
  permissions: string[];
  lastLoginAt?: Date;
  twoFactorEnabled: boolean;
  inviteToken?: string;
  inviteTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended', 'deactivated'],
      default: 'active',
    },
    roleIds: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    permissions: [{ type: String }],
    lastLoginAt: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    inviteToken: { type: String, select: false },
    inviteTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// Compound unique index: one email per tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, storeId: 1, status: 1 });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
