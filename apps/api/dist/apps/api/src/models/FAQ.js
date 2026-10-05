"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQ = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const faqSchema = new mongoose_1.default.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'general' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
faqSchema.index({ status: 1, category: 1, order: 1 });
exports.FAQ = mongoose_1.default.models.FAQ || mongoose_1.default.model('FAQ', faqSchema);
//# sourceMappingURL=FAQ.js.map