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
exports.ProductionOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productionOrderSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    orderNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    manufacturerId: { type: mongoose_1.Schema.Types.Mixed, required: true },
    manufacturerName: { type: String },
    product: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    completedQuantity: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    targetDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Draft', 'Planned', 'In Production', 'Delayed', 'Completed', 'Cancelled'],
        default: 'Planned',
    },
    stage: {
        type: String,
        enum: [
            'Pattern Making',
            'Fabric Cutting',
            'Stitching & Assembly',
            'Printing / Embroidery',
            'Finishing & Ironing',
            'Final Packaging',
            'Ready for QC',
        ],
        default: 'Pattern Making',
    },
    delayReason: { type: String },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    batchNumber: { type: String },
    destinationWarehouse: { type: String, default: 'Central Hub - BLR' },
    createdBy: { type: mongoose_1.Schema.Types.Mixed },
    updatedBy: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
exports.ProductionOrder = mongoose_1.default.models.ProductionOrder || mongoose_1.default.model('ProductionOrder', productionOrderSchema);
//# sourceMappingURL=ProductionOrder.js.map