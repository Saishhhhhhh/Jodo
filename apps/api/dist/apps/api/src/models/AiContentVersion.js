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
exports.AiContentVersion = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const aiContentVersionSchema = new mongoose_1.Schema({
    contentId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    content: { type: mongoose_1.Schema.Types.Mixed, required: true },
    qualityScore: { type: Number },
    modifiedBy: { type: String, default: 'Admin' },
    action: { type: String, required: true },
    notes: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });
aiContentVersionSchema.index({ contentId: 1, version: 1 }, { unique: true });
exports.AiContentVersion = mongoose_1.default.models.AiContentVersion ||
    mongoose_1.default.model('AiContentVersion', aiContentVersionSchema);
//# sourceMappingURL=AiContentVersion.js.map