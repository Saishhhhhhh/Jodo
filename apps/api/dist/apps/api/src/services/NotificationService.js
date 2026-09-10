"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_1 = require("../models/Notification");
const Product_1 = require("../models/Product");
const InventoryIntelligenceService_1 = require("./InventoryIntelligenceService");
class NotificationService {
    /**
     * Evaluate inventory states for a specific item and trigger notifications if state changed
     */
    static async checkInventoryItem(item) {
        const stats = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateStockStatus(item);
        const availableStock = stats.availableStock;
        const reorderLevel = item.reorderLevel || 10;
        // We need some mock demand for now if not passed, but in a real app we'd query sales
        const demandLevel = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateDemandSignal(0); // Assuming low demand for instant check
        let currentState = 'in_stock';
        let severity = 'info';
        let title = '';
        let message = '';
        let action = '';
        let targetRoles = ['admin', 'operations'];
        if (availableStock <= 0) {
            currentState = 'Out of Stock';
            severity = 'critical';
            title = 'Out of Stock Alert';
            action = 'Contact Supplier';
            targetRoles = ['admin', 'operations', 'sales'];
        }
        else if (availableStock <= reorderLevel * 0.5) {
            currentState = 'Critical Stock';
            severity = 'critical';
            title = 'Critical Stock Alert';
            action = 'Urgent Reorder';
            targetRoles = ['admin', 'operations', 'sales'];
        }
        else if (availableStock <= reorderLevel) {
            currentState = 'Low Stock';
            severity = 'warning';
            title = 'Low Stock Alert';
            action = 'Monitor/Reorder';
            targetRoles = ['admin', 'operations', 'sales'];
        }
        else {
            currentState = 'In Stock';
        }
        if (currentState !== 'In Stock' && (demandLevel === 'High' || demandLevel === 'Very High')) {
            title = 'Urgent Reorder Required (High Demand)';
            severity = 'critical';
            action = 'Reorder Now';
        }
        // Check if there is an active unresolved notification for this SKU
        const existingNotif = await Notification_1.Notification.findOne({
            storeId: item.storeId,
            'metadata.sku': item.sku,
            type: 'inventory_alert',
            state: { $in: ['unread', 'read', 'dismissed'] }
        });
        if (currentState === 'In Stock') {
            // If it's in stock, resolve any existing alert and maybe send a "Stock Recovered"
            if (existingNotif && existingNotif.metadata?.alertState !== 'In Stock') {
                existingNotif.state = 'resolved';
                await existingNotif.save();
                const prod = await Product_1.Product.findOne({ sku: item.sku }).select('title category').lean();
                await Notification_1.Notification.create({
                    tenantId: item.tenantId,
                    storeId: item.storeId,
                    type: 'inventory_alert',
                    title: 'Stock Recovered',
                    message: `${prod?.title || item.sku} is back in stock. Available: ${availableStock}`,
                    severity: 'info',
                    state: 'unread',
                    targetRoles: ['admin', 'operations', 'sales'],
                    metadata: {
                        sku: item.sku,
                        productName: prod?.title,
                        category: prod?.category,
                        location: item.locationName,
                        availableStock,
                        totalStock: item.onHand,
                        reservedStock: item.reservedStock,
                        reorderLevel,
                        alertState: 'In Stock',
                        recommendedAction: 'No Action Required'
                    }
                });
            }
            return;
        }
        // If state changed or no existing notification
        if (!existingNotif || existingNotif.metadata?.alertState !== currentState) {
            if (existingNotif) {
                existingNotif.state = 'resolved';
                await existingNotif.save();
            }
            const prod = await Product_1.Product.findOne({ sku: item.sku }).select('title category').lean();
            message = `${prod?.title || item.sku} is ${currentState}. Available: ${availableStock}. Reorder level is ${reorderLevel}.`;
            await Notification_1.Notification.create({
                tenantId: item.tenantId,
                storeId: item.storeId,
                type: 'inventory_alert',
                title,
                message,
                severity,
                state: 'unread',
                targetRoles,
                metadata: {
                    sku: item.sku,
                    productName: prod?.title,
                    category: prod?.category,
                    location: item.locationName,
                    availableStock,
                    totalStock: item.onHand,
                    reservedStock: item.reservedStock,
                    reorderLevel,
                    demandLevel,
                    alertState: currentState,
                    recommendedAction: action
                }
            });
        }
    }
    static async checkExpiringReservations() {
        // Logic for expiring reservations... called from cron
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=NotificationService.js.map