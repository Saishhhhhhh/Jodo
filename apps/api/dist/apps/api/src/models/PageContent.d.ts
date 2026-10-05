import mongoose from 'mongoose';
export declare const PageContent: mongoose.Model<{
    pageKey: string;
    topicCards: mongoose.Types.DocumentArray<{
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }> & {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }>;
    extraSections: any;
    header?: {
        title: string;
        tagline: string;
        subtitle: string;
        bannerImage: string;
    } | null | undefined;
    conciergeBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        buttonUrl: string;
        bannerImage: string;
        badge1: string;
        badge2: string;
        phoneText: string;
        phoneNumber: string;
    } | null | undefined;
    newsletterBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        bannerImage: string;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    pageKey: string;
    topicCards: mongoose.Types.DocumentArray<{
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }> & {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }>;
    extraSections: any;
    header?: {
        title: string;
        tagline: string;
        subtitle: string;
        bannerImage: string;
    } | null | undefined;
    conciergeBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        buttonUrl: string;
        bannerImage: string;
        badge1: string;
        badge2: string;
        phoneText: string;
        phoneNumber: string;
    } | null | undefined;
    newsletterBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        bannerImage: string;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    pageKey: string;
    topicCards: mongoose.Types.DocumentArray<{
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }> & {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }>;
    extraSections: any;
    header?: {
        title: string;
        tagline: string;
        subtitle: string;
        bannerImage: string;
    } | null | undefined;
    conciergeBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        buttonUrl: string;
        bannerImage: string;
        badge1: string;
        badge2: string;
        phoneText: string;
        phoneNumber: string;
    } | null | undefined;
    newsletterBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        bannerImage: string;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    pageKey: string;
    topicCards: mongoose.Types.DocumentArray<{
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }> & {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }>;
    extraSections: any;
    header?: {
        title: string;
        tagline: string;
        subtitle: string;
        bannerImage: string;
    } | null | undefined;
    conciergeBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        buttonUrl: string;
        bannerImage: string;
        badge1: string;
        badge2: string;
        phoneText: string;
        phoneNumber: string;
    } | null | undefined;
    newsletterBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        bannerImage: string;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    pageKey: string;
    topicCards: mongoose.Types.DocumentArray<{
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }> & {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }>;
    extraSections: any;
    header?: {
        title: string;
        tagline: string;
        subtitle: string;
        bannerImage: string;
    } | null | undefined;
    conciergeBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        buttonUrl: string;
        bannerImage: string;
        badge1: string;
        badge2: string;
        phoneText: string;
        phoneNumber: string;
    } | null | undefined;
    newsletterBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        bannerImage: string;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    pageKey: string;
    topicCards: mongoose.Types.DocumentArray<{
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }> & {
        desc: string;
        title: string;
        category: string;
        image: string;
        icon: string;
    }>;
    extraSections: any;
    header?: {
        title: string;
        tagline: string;
        subtitle: string;
        bannerImage: string;
    } | null | undefined;
    conciergeBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        buttonUrl: string;
        bannerImage: string;
        badge1: string;
        badge2: string;
        phoneText: string;
        phoneNumber: string;
    } | null | undefined;
    newsletterBanner?: {
        description: string;
        tagline: string;
        heading: string;
        buttonText: string;
        bannerImage: string;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
