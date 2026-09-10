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
exports.WarehouseIssue = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const warehouseIssueSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    issueNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: {
        type: String,
        enum: [
            'Production Delay',
            'Procurement Delay',
            'Quality Failure',
            'Stock Discrepancy',
            'Damaged Goods',
        ],
        required: true,
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },
    relatedOrder: { type: String, required: true },
    product: { type: String, required: true },
    supplierManufacturer: { type: String, required: true },
    issueDescription: { type: String, required: true },
    reportedDate: { type: Date, default: Date.now },
    expectedResolution: { type: Date },
    assignedTo: { type: String, default: 'Warehouse Manager' },
    status: {
        type: String,
        enum: ['Open', 'Investigating', 'Vendor Contacted', 'Action Taken', 'Resolved'],
        default: 'Open',
    },
    resolutionNotes: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.Mixed },
    updatedBy: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
exports.WarehouseIssue = mongoose_1.default.models.WarehouseIssue ||
    mongoose_1.default.model('WarehouseIssue', warehouseIssueSchema);
//# sourceMappingURL=WarehouseIssue.js.map