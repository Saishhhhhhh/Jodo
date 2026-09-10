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
exports.GiftCard = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const giftCardSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    initialValue: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date },
    recipientEmail: { type: String, lowercase: true, trim: true },
    note: { type: String },
    status: {
        type: String,
        enum: ['active', 'disabled', 'expired'],
        default: 'active',
        index: true,
    },
}, { timestamps: true });
giftCardSchema.index({ storeId: 1, code: 1 }, { unique: true });
exports.GiftCard = mongoose_1.default.models.GiftCard || mongoose_1.default.model('GiftCard', giftCardSchema);
//# sourceMappingURL=GiftCard.js.map