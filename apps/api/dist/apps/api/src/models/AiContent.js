"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiContent = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const aiContentSchema = new mongoose_1.Schema({
    contentId: { type: String, required: true, unique: true, index: true },
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant' },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store' },
    contentType: {
        type: String,
        enum: ['product_description', 'catalogue_content', 'listing_copy', 'campaign_content'],
        required: true,
        index: true,
    },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', index: true },
    productName: { type: String },
    sku: { type: String },
    category: { type: String },
    price: { type: Number },
    imageUrl: { type: String },
    campaignId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Campaign' },
    campaignName: { type: String },
    title: { type: String, required: true },
    generatedContent: { type: mongoose_1.Schema.Types.Mixed, required: true },
    editedContent: { type: mongoose_1.Schema.Types.Mixed },
    tone: { type: String, default: 'Luxury' },
    length: { type: String, default: 'Medium' },
    channel: { type: String, default: 'Website' },
    targetAudience: { type: String },
    seoKeywords: [{ type: String }],
    seoOptimized: { type: Boolean, default: true },
    qualityScore: { type: Number, default: 92, min: 0, max: 100 },
    qualityChecks: {
        grammar: { type: Boolean, default: true },
        brandTone: { type: Boolean, default: true },
        seo: { type: Boolean, default: true },
        productAccuracy: { type: Boolean, default: true },
        duplicateRisk: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
        unsupportedClaimsCount: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending Review', 'Changes Requested', 'Approved', 'Published', 'Rejected'],
        default: 'Draft',
        index: true,
    },
    version: { type: Number, default: 1 },
    createdBy: { type: String, default: 'Admin' },
    submittedBy: { type: String },
    reviewedBy: { type: String },
    approvedBy: { type: String },
    publishedBy: { type: String },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    publishedAt: { type: Date },
    reviewNotes: { type: String },
}, { timestamps: true });
exports.AiContent = mongoose_1.default.models.AiContent || mongoose_1.default.model('AiContent', aiContentSchema);
//# sourceMappingURL=AiContent.js.map