import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailVerification extends Document {
  customerId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  email: string;
  otpHash: string;
  expiresAt: Date;
  attemptCount: number;
  lastSentAt: Date;
  resendCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attemptCount: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    resendCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for querying active verification by email
emailVerificationSchema.index({ email: 1, createdAt: -1 });

// TTL index to automatically purge records 2 hours after creation
emailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

export const EmailVerification =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerification>('EmailVerification', emailVerificationSchema);
