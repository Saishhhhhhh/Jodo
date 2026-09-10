"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bannerSchema = new mongoose_1.default.Schema({
    tenantId: { type: String, required: true },
    storeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Store', required: true },
    image: { type: String, required: true },
    tagline: { type: String, required: true },
    heading: { type: String, required: true },
    subtext: { type: String, required: true },
    buttonText: { type: String, default: 'Discover Now' },
    buttonUrl: { type: String, default: '/shop' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
}, { timestamps: true });
// Add index for fast retrieval by store
bannerSchema.index({ storeId: 1, status: 1, order: 1 });
exports.Banner = mongoose_1.default.model('Banner', bannerSchema);
//# sourceMappingURL=Banner.js.map