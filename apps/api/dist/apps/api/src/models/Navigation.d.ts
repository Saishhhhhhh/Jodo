import mongoose from 'mongoose';
export declare const Navigation: mongoose.Model<{
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    title: string;
    items: mongoose.Types.DocumentArray<{
        id: string;
        url: string;
        label: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        url: string;
        label: string;
    }> & {
        id: string;
        url: string;
        label: string;
    }>;
    handle: string;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    title: string;
    items: mongoose.Types.DocumentArray<{
        id: string;
        url: string;
        label: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        url: string;
        label: string;
    }> & {
        id: string;
        url: string;
        label: string;
    }>;
    handle: string;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    title: string;
    items: mongoose.Types.DocumentArray<{
        id: string;
        url: string;
        label: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        url: string;
        label: string;
    }> & {
        id: string;
        url: string;
        label: string;
    }>;
    handle: string;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    title: string;
    items: mongoose.Types.DocumentArray<{
        id: string;
        url: string;
        label: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        url: string;
        label: string;
    }> & {
        id: string;
        url: string;
        label: string;
    }>;
    handle: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    title: string;
    items: mongoose.Types.DocumentArray<{
        id: string;
        url: string;
        label: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        url: string;
        label: string;
    }> & {
        id: string;
        url: string;
        label: string;
    }>;
    handle: string;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    tenantId: string;
    storeId: mongoose.Types.ObjectId;
    title: string;
    items: mongoose.Types.DocumentArray<{
        id: string;
        url: string;
        label: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        id: string;
        url: string;
        label: string;
    }> & {
        id: string;
        url: string;
        label: string;
    }>;
    handle: string;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
