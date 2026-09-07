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
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, index: true },
    barcode: { type: String },
    inventoryQuantity: { type: Number, default: 0 },
    category: { type: String, default: 'Uncategorized' },
    vendor: { type: String, default: '' },
    imageUrl: { type: String },
    galleryImages: [{ type: String }],
    model3dUrl: { type: String },
    videoUrl: { type: String },
    brochureUrl: { type: String },
    material: { type: String },
    dimensions: { type: String },
    weight: { type: Number },
    assemblyRequired: { type: Boolean, default: false },
    shortDescription: { type: String },
    longDescription: { type: String },
    emiAvailable: { type: Boolean, default: false },
    emiStartingFrom: { type: Number },
    additionalOffers: [{ type: String }],
    assemblyFee: { type: Number },
    careAndMaintenance: { type: String },
    warrantyTerms: { type: String },
    productDetails: { type: Map, of: String },
    specifications: [{ key: { type: String }, value: { type: String } }],
    tags: [{ type: String }],
    addons: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });
// Compound index to ensure slug is unique per store
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });
exports.Product = mongoose_1.default.models.Product || mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map