import mongoose from 'mongoose';
export declare const Banner: mongoose.Model<{
    status: "active" | "inactive";
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    image: string;
    tagline: string;
    heading: string;
    subtext: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "active" | "inactive";
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    image: string;
    tagline: string;
    heading: string;
    subtext: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "active" | "inactive";
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    image: string;
    tagline: string;
    heading: string;
    subtext: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "active" | "inactive";
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    image: string;
    tagline: string;
    heading: string;
    subtext: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "active" | "inactive";
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    image: string;
    tagline: string;
    heading: string;
    subtext: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "active" | "inactive";
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    image: string;
    tagline: string;
    heading: string;
    subtext: string;
    buttonText: string;
    buttonUrl: string;
    order: number;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
