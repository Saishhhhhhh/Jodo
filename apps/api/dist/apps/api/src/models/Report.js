"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reportSchema = new mongoose_1.default.Schema({
    tenantId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    storeId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'custom'], required: true },
    dateRange: {
        from: { type: Date, required: true },
        to: { type: Date, required: true }
    },
    status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'completed' },
    data: { type: mongoose_1.default.Schema.Types.Mixed },
    downloadUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});
exports.Report = mongoose_1.default.models.Report || mongoose_1.default.model('Report', reportSchema);
//# sourceMappingURL=Report.js.map