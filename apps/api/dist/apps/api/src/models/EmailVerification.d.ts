import mongoose, { Document } from 'mongoose';
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
export declare const EmailVerification: mongoose.Model<any, {}, {}, {}, any, any>;
