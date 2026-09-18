import mongoose from 'mongoose';
export declare const Media: mongoose.Model<{
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    filename: string;
    url: string;
    mimeType: string;
    size: number;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
