import mongoose, { Document } from 'mongoose';
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
    comparePassword(password: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
