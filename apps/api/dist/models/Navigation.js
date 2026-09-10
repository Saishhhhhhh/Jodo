"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const navigationItemSchema = new mongoose_1.default.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
});
const navigationSchema = new mongoose_1.default.Schema({
    tenantId: { type: String, required: true },
    storeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Store', required: true },
    title: { type: String, required: true },
    handle: { type: String, required: true },
    items: [navigationItemSchema],
}, { timestamps: true });
// Ensure a store doesn't have duplicate navigation handles
navigationSchema.index({ storeId: 1, handle: 1 }, { unique: true });
exports.Navigation = mongoose_1.default.model('Navigation', navigationSchema);
//# sourceMappingURL=Navigation.js.map