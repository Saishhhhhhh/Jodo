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
exports.InventoryItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const inventoryItemSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    sku: { type: String, required: true },
    locationName: { type: String, required: true },
    onHand: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    committed: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock'],
        default: 'out_of_stock',
    },
    reservedStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    reorderQuantity: { type: Number, default: 50 },
    lastRestockedAt: { type: Date },
}, { timestamps: true });
const NotificationService_1 = require("../services/NotificationService");
// ... other imports
inventoryItemSchema.index({ storeId: 1, sku: 1, locationName: 1 }, { unique: true });
inventoryItemSchema.post('save', async function (doc) {
    // Fire and forget stock check
    NotificationService_1.NotificationService.checkInventoryItem(doc).catch(err => console.error('Inventory check failed:', err));
});
exports.InventoryItem = mongoose_1.default.models.InventoryItem || mongoose_1.default.model('InventoryItem', inventoryItemSchema);
//# sourceMappingURL=InventoryItem.js.map