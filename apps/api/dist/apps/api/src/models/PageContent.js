"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageContent = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pageContentSchema = new mongoose_1.default.Schema({
    pageKey: { type: String, required: true, unique: true }, // 'faqs' | 'blog'
    header: {
        tagline: { type: String, default: '' },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        bannerImage: { type: String, default: '' },
    },
    topicCards: [
        {
            title: { type: String, default: '' },
            desc: { type: String, default: '' },
            category: { type: String, default: '' },
            icon: { type: String, default: 'puzzle' }, // 'puzzle' | 'truck' | 'shield' | 'wrench'
            image: { type: String, default: '' },
        },
    ],
    conciergeBanner: {
        tagline: { type: String, default: 'Need Personal Assistance?' },
        heading: { type: String, default: 'Still have a question about your home?' },
        description: {
            type: String,
            default: 'Our in-house design team is ready to help with custom dimensions, timber swatches, order updates, or assembly assistance.',
        },
        badge1: { type: String, default: '5-Year Warranty' },
        badge2: { type: String, default: 'Free Doorstep Delivery' },
        buttonText: { type: String, default: 'Contact Concierge' },
        buttonUrl: { type: String, default: '/contact' },
        phoneText: { type: String, default: 'Call Us' },
        phoneNumber: { type: String, default: '+918001234567' },
        bannerImage: { type: String, default: '' },
    },
    newsletterBanner: {
        tagline: { type: String, default: 'The Jodo Society • Monthly Dispatch' },
        heading: { type: String, default: 'Bring timeless craft into your inbox.' },
        description: {
            type: String,
            default: 'Curated essays on architecture, early notice for seasonal timber collections, and the secrets of tool-free furniture.',
        },
        buttonText: { type: String, default: 'Join Society' },
        bannerImage: { type: String, default: '' },
    },
    extraSections: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
exports.PageContent = mongoose_1.default.model('PageContent', pageContentSchema);
//# sourceMappingURL=PageContent.js.map