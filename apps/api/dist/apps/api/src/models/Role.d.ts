import mongoose, { Document } from 'mongoose';
export interface IRole extends Document {
    tenantId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    permissions: string[];
    isSystemRole: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Role: mongoose.Model<IRole, {}, {}, {}, mongoose.Document<unknown, {}, IRole, {}, {}> & IRole & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
