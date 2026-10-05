"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryIntelligenceService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const InventoryItem_1 = require("../models/InventoryItem");
const Product_1 = require("../models/Product");
const StockMovement_1 = require("../models/StockMovement");
const Reservation_1 = require("../models/Reservation");
class InventoryIntelligenceService {
    /**
     * Section 2: Core Stock Calculation
     * Available Stock = Total Stock (onHand) - Reserved Stock
     * Never allow Available Stock to become negative.
     *
     * IF Available Stock <= 0 -> OUT OF STOCK
     * ELSE IF Available Stock <= Reorder Level -> LOW STOCK
     * ELSE -> IN STOCK
     */
    static calculateStockStatus(item) {
        const totalStock = Math.max(0, item.onHand ?? 0);
        const reservedStock = Math.max(0, item.reservedStock ?? 0);
        const availableStock = Math.max(0, totalStock - reservedStock);
        const reorderLevel = item.reorderLevel ?? 10;
        let status = 'in_stock';
        let statusLabel = 'In Stock';
        if (availableStock <= 0) {
            status = 'out_of_stock';
            statusLabel = 'Out of Stock';
        }
        else if (availableStock <= reorderLevel) {
            status = 'low_stock';
            statusLabel = 'Low Stock';
        }
        else {
            status = 'in_stock';
            statusLabel = 'In Stock';
        }
        return {
            totalStock,
            reservedStock,
            availableStock,
            reorderLevel,
            status,
            statusLabel,
        };
    }
    /**
     * Section 6 & 7: Professional Stock Adjustment with Audit Trail
     * Supports: ADD_STOCK, REMOVE_STOCK, SET_STOCK, UPDATE_REORDER_LEVEL
     * Validates server-side, never trusts frontend quantities.
     * Creates an immutable audit trail in StockMovement.
     */
    static async adjustStock(params) {
        const { tenantId, storeId, sku, action, quantity, reason, userId, adminName } = params;
        if (!sku || typeof sku !== 'string' || !sku.trim()) {
            throw new Error('Valid SKU is required');
        }
        if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 0) {
            throw new Error('Quantity must be a non-negative number');
        }
        const tId = new mongoose_1.default.Types.ObjectId(tenantId.toString());
        const sId = new mongoose_1.default.Types.ObjectId(storeId.toString());
        // 1. Locate or create the InventoryItem
        let item = await InventoryItem_1.InventoryItem.findOne({ storeId: sId, sku: sku.trim() });
        const product = await Product_1.Product.findOne({ storeId: sId, sku: sku.trim() });
        if (!item) {
            item = new InventoryItem_1.InventoryItem({
                tenantId: tId,
                storeId: sId,
                sku: sku.trim(),
                locationName: 'Primary Warehouse',
                onHand: product?.inventoryQuantity || 0,
                available: product?.inventoryQuantity || 0,
                reservedStock: 0,
                reorderLevel: 10,
                status: 'out_of_stock',
            });
        }
        const previousOnHand = item.onHand ?? 0;
        const previousReserved = item.reservedStock ?? 0;
        const previousReorderLevel = item.reorderLevel ?? 10;
        let newOnHand = previousOnHand;
        let newReorderLevel = previousReorderLevel;
        let adjustmentQuantity = 0;
        let movementType = 'Manual Adjustment';
        switch (action) {
            case 'ADD_STOCK': {
                newOnHand = previousOnHand + quantity;
                adjustmentQuantity = quantity;
                movementType = 'Stock Added';
                break;
            }
            case 'REMOVE_STOCK': {
                if (quantity > previousOnHand) {
                    throw new Error(`Cannot remove ${quantity} units. Only ${previousOnHand} total units exist.`);
                }
                // Concurrency / Stock Safety: Available stock cannot drop below 0
                if (previousOnHand - quantity < previousReserved) {
                    throw new Error(`Cannot remove ${quantity} units. ${previousReserved} units are currently reserved for pending orders.`);
                }
                newOnHand = previousOnHand - quantity;
                adjustmentQuantity = -quantity;
                movementType = 'Stock Reduced';
                break;
            }
            case 'SET_STOCK': {
                if (quantity < previousReserved) {
                    throw new Error(`Cannot set total stock to ${quantity}. ${previousReserved} units are currently reserved for pending orders.`);
                }
                adjustmentQuantity = quantity - previousOnHand;
                newOnHand = quantity;
                movementType = 'Manual Adjustment';
                break;
            }
            case 'UPDATE_REORDER_LEVEL': {
                newReorderLevel = quantity;
                adjustmentQuantity = quantity - previousReorderLevel;
                movementType = 'Manual Adjustment';
                break;
            }
            default:
                throw new Error(`Unsupported adjustment action: ${action}`);
        }
        // 2. Apply updates to InventoryItem
        if (action !== 'UPDATE_REORDER_LEVEL') {
            item.onHand = newOnHand;
        }
        else {
            item.reorderLevel = newReorderLevel;
        }
        const calculation = this.calculateStockStatus(item);
        item.available = calculation.availableStock;
        item.status = calculation.status;
        item.lastRestockedAt = action === 'ADD_STOCK' ? new Date() : item.lastRestockedAt;
        await item.save();
        // 3. Keep Product inventory in sync
        if (action !== 'UPDATE_REORDER_LEVEL') {
            await Product_1.Product.updateOne({ storeId: sId, sku: sku.trim() }, { $set: { inventoryQuantity: newOnHand } }).catch((err) => console.error('[InventoryService] Product sync failed:', err));
        }
        // 4. Section 7: Record Audit Trail in StockMovement
        const auditRecord = await StockMovement_1.StockMovement.create({
            tenantId: tId,
            storeId: sId,
            productId: product?._id,
            sku: sku.trim(),
            movementType,
            action,
            previousQuantity: action === 'UPDATE_REORDER_LEVEL' ? previousReorderLevel : previousOnHand,
            adjustmentQuantity,
            newQuantity: action === 'UPDATE_REORDER_LEVEL' ? newReorderLevel : newOnHand,
            reason: reason?.trim() || 'Manual stock adjustment',
            quantity: adjustmentQuantity,
            reference: `Manual Adjustment: ${action}`,
            updatedBy: userId ? new mongoose_1.default.Types.ObjectId(userId.toString()) : undefined,
            adminName: adminName || 'Admin',
        });
        return {
            item,
            calculation,
            auditRecord,
        };
    }
    /**
     * Section 3 & 8: Atomic Stock Reservation for Orders
     * Customer places order -> Validate available stock -> Reserve required quantity
     * -> Increase Reserved Stock -> Available decreases atomically.
     */
    static async reserveStockForOrder(tenantId, storeId, orderId, orderNumber, items) {
        const tId = new mongoose_1.default.Types.ObjectId(tenantId.toString());
        const sId = new mongoose_1.default.Types.ObjectId(storeId.toString());
        const reservedItems = [];
        try {
            for (const orderItem of items) {
                const sku = orderItem.sku?.trim();
                const qty = Number(orderItem.quantity || 1);
                if (!sku || qty <= 0)
                    continue;
                // Ensure inventory item exists
                let invItem = await InventoryItem_1.InventoryItem.findOne({ storeId: sId, sku });
                if (!invItem) {
                    const prod = await Product_1.Product.findOne({ storeId: sId, sku });
                    invItem = await InventoryItem_1.InventoryItem.create({
                        tenantId: tId,
                        storeId: sId,
                        sku,
                        locationName: 'Primary Warehouse',
                        onHand: prod?.inventoryQuantity || 0,
                        available: prod?.inventoryQuantity || 0,
                        reservedStock: 0,
                        reorderLevel: 10,
                        status: 'out_of_stock',
                    });
                }
                // Section 8: Concurrency / Stock Safety
                // Atomically increment reservedStock ONLY IF (onHand - reservedStock) >= requested qty
                const updated = await InventoryItem_1.InventoryItem.findOneAndUpdate({
                    storeId: sId,
                    sku,
                    $expr: {
                        $gte: [
                            { $subtract: [{ $ifNull: ['$onHand', 0] }, { $ifNull: ['$reservedStock', 0] }] },
                            qty,
                        ],
                    },
                }, {
                    $inc: { reservedStock: qty },
                }, { new: true });
                if (!updated) {
                    throw new Error(`Insufficient available stock for SKU "${sku}". Order cannot reserve ${qty} units.`);
                }
                // Recalculate available and status
                const calc = this.calculateStockStatus(updated);
                updated.available = calc.availableStock;
                updated.status = calc.status;
                await updated.save();
                // Create active Reservation document
                const resv = await Reservation_1.Reservation.create({
                    tenantId: tId,
                    storeId: sId,
                    productId: orderItem.productId || invItem._id,
                    sku,
                    referenceType: 'order',
                    referenceId: String(orderId),
                    reservedQuantity: qty,
                    status: 'active',
                });
                // Audit StockMovement
                await StockMovement_1.StockMovement.create({
                    tenantId: tId,
                    storeId: sId,
                    productId: orderItem.productId,
                    sku,
                    movementType: 'Stock Reserved',
                    action: 'RESERVE_STOCK',
                    quantity: qty,
                    previousQuantity: calc.availableStock + qty,
                    adjustmentQuantity: qty,
                    newQuantity: calc.availableStock,
                    reference: `Order #${orderNumber || orderId}`,
                    reason: `Reserved for active order #${orderNumber || orderId}`,
                });
                reservedItems.push({ sku, quantity: qty, reservationId: String(resv._id) });
            }
            return { success: true, reservedItems };
        }
        catch (error) {
            // Rollback any items successfully reserved in this transaction
            for (const rollback of reservedItems) {
                await InventoryItem_1.InventoryItem.updateOne({ storeId: sId, sku: rollback.sku }, [
                    {
                        $set: {
                            reservedStock: { $max: [0, { $subtract: ['$reservedStock', rollback.quantity] }] },
                        },
                    },
                ]).catch(() => { });
                await Reservation_1.Reservation.updateOne({ _id: rollback.reservationId }, { $set: { status: 'released' } }).catch(() => { });
            }
            throw error;
        }
    }
    /**
     * Section 3: Release Reservation when order is cancelled, rejected, or refunded
     */
    static async releaseOrderReservation(tenantId, storeId, orderId, reason = 'Order cancelled/refunded') {
        const sId = new mongoose_1.default.Types.ObjectId(storeId.toString());
        const tId = new mongoose_1.default.Types.ObjectId(tenantId.toString());
        const refId = String(orderId);
        const activeReservations = await Reservation_1.Reservation.find({
            storeId: sId,
            referenceId: refId,
            status: 'active',
        });
        for (const resv of activeReservations) {
            resv.status = 'released';
            await resv.save();
            const item = await InventoryItem_1.InventoryItem.findOne({ storeId: sId, sku: resv.sku });
            if (item) {
                item.reservedStock = Math.max(0, (item.reservedStock || 0) - resv.reservedQuantity);
                const calc = this.calculateStockStatus(item);
                item.available = calc.availableStock;
                item.status = calc.status;
                await item.save();
                await StockMovement_1.StockMovement.create({
                    tenantId: tId,
                    storeId: sId,
                    sku: resv.sku,
                    movementType: 'Reservation Released',
                    action: 'RELEASE_RESERVATION',
                    quantity: -resv.reservedQuantity,
                    reason,
                    reference: `Order #${refId} Released`,
                });
            }
        }
        return { releasedCount: activeReservations.length };
    }
    /**
     * Section 3: Fulfill Order Reservation
     * Deducts onHand and releases reservedStock so Available Stock remains accurate without double deduction.
     */
    static async fulfillOrderReservation(tenantId, storeId, orderId) {
        const sId = new mongoose_1.default.Types.ObjectId(storeId.toString());
        const tId = new mongoose_1.default.Types.ObjectId(tenantId.toString());
        const refId = String(orderId);
        const activeReservations = await Reservation_1.Reservation.find({
            storeId: sId,
            referenceId: refId,
            status: 'active',
        });
        for (const resv of activeReservations) {
            resv.status = 'converted';
            await resv.save();
            const item = await InventoryItem_1.InventoryItem.findOne({ storeId: sId, sku: resv.sku });
            if (item) {
                const previousOnHand = item.onHand || 0;
                item.onHand = Math.max(0, (item.onHand || 0) - resv.reservedQuantity);
                item.reservedStock = Math.max(0, (item.reservedStock || 0) - resv.reservedQuantity);
                const calc = this.calculateStockStatus(item);
                item.available = calc.availableStock;
                item.status = calc.status;
                await item.save();
                // Update product inventory count
                await Product_1.Product.updateOne({ storeId: sId, sku: resv.sku }, { $inc: { inventoryQuantity: -resv.reservedQuantity } }).catch(() => { });
                await StockMovement_1.StockMovement.create({
                    tenantId: tId,
                    storeId: sId,
                    sku: resv.sku,
                    movementType: 'Order Confirmed',
                    action: 'FULFILL_ORDER',
                    quantity: -resv.reservedQuantity,
                    previousQuantity: previousOnHand,
                    adjustmentQuantity: -resv.reservedQuantity,
                    newQuantity: item.onHand,
                    reason: `Order #${refId} successfully fulfilled`,
                    reference: `Order #${refId} Fulfilled`,
                });
            }
        }
        return { fulfilledCount: activeReservations.length };
    }
    /**
     * Phase 2 Demand Signals Helper
     */
    static calculateDemandSignal(unitsSoldLast30Days, openQuotationsQty = 0, pendingOrderQty = 0, leadCount = 0) {
        const score = unitsSoldLast30Days + openQuotationsQty * 0.5 + pendingOrderQty * 0.8 + leadCount * 0.2;
        let level = 'Low';
        if (score > 50)
            level = 'Very High';
        else if (score > 20)
            level = 'High';
        else if (score > 5)
            level = 'Medium';
        return level;
    }
    static calculateEstimatedStockDays(availableStock, unitsSoldLast30Days) {
        if (unitsSoldLast30Days <= 0)
            return null;
        const averageDailySales = unitsSoldLast30Days / 30;
        return Math.round(availableStock / averageDailySales);
    }
    static isReorderRecommended(availableStock, demandLevel, estimatedDays) {
        const safetyPeriod = 14;
        if (availableStock <= 0)
            return true;
        if (demandLevel === 'High' || demandLevel === 'Very High') {
            if (estimatedDays !== null && estimatedDays < safetyPeriod) {
                return true;
            }
            if (availableStock < 10)
                return true;
        }
        return false;
    }
}
exports.InventoryIntelligenceService = InventoryIntelligenceService;
//# sourceMappingURL=InventoryIntelligenceService.js.map