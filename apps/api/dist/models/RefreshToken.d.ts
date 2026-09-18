import mongoose, { Document } from 'mongoose';
export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    token: string;
    family: string;
    isRevoked: boolean;
    expiresAt: Date;
    createdAt: Date;
}
export declare const RefreshToken: mongoose.Model<IRefreshToken, {}, {}, {}, mongoose.Document<unknown, {}, IRefreshToken, {}, {}> & IRefreshToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
