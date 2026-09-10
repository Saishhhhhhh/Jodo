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
exports.FulfilmentReadiness = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const fulfilmentReadinessSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    orderId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customer: { type: String, required: true },
    channel: { type: String, default: 'Online Store' },
    product: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    requiredDate: { type: Date, required: true },
    readinessScore: { type: Number, default: 0, min: 0, max: 100 },
    conditions: {
        stockAvailable: { type: Boolean, default: false },
        stockReserved: { type: Boolean, default: false },
        productionCompleted: { type: Boolean, default: false },
        qcPassed: { type: Boolean, default: false },
        packagingReady: { type: Boolean, default: false },
        dispatchPrepared: { type: Boolean, default: false },
    },
    status: {
        type: String,
        enum: [
            'Ready for Fulfilment',
            'Almost Ready',
            'Partially Ready',
            'At Risk',
            'Not Ready',
            'Dispatched',
        ],
        default: 'Not Ready',
    },
    warehouse: { type: String, default: 'Central Hub - BLR' },
    createdBy: { type: mongoose_1.Schema.Types.Mixed },
    updatedBy: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
exports.FulfilmentReadiness = mongoose_1.default.models.FulfilmentReadiness ||
    mongoose_1.default.model('FulfilmentReadiness', fulfilmentReadinessSchema);
//# sourceMappingURL=FulfilmentReadiness.js.map