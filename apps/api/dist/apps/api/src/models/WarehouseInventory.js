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
exports.WarehouseInventory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const warehouseInventorySchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    warehouseId: { type: mongoose_1.Schema.Types.Mixed, required: true, index: true },
    warehouseName: { type: String, required: true },
    product: { type: String, required: true },
    sku: { type: String, required: true, index: true },
    stockInHand: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0 },
    incoming: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 100, min: 0 },
    status: {
        type: String,
        enum: ['Healthy', 'Low Stock', 'Critical', 'Out of Stock'],
        default: 'Healthy',
    },
    lastUpdated: { type: Date, default: Date.now },
    createdBy: { type: mongoose_1.Schema.Types.Mixed },
    updatedBy: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
warehouseInventorySchema.index({ warehouseName: 1, sku: 1 }, { unique: true });
exports.WarehouseInventory = mongoose_1.default.models.WarehouseInventory ||
    mongoose_1.default.model('WarehouseInventory', warehouseInventorySchema);
//# sourceMappingURL=WarehouseInventory.js.map