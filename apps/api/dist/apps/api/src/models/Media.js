"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mediaSchema = new mongoose_1.default.Schema({
    tenantId: { type: String, required: true },
    storeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Store', required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
}, { timestamps: true });
mediaSchema.index({ storeId: 1, createdAt: -1 });
exports.Media = mongoose_1.default.model('Media', mediaSchema);
//# sourceMappingURL=Media.js.map