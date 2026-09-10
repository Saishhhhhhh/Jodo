"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const InventoryItem_1 = require("../models/InventoryItem");
const Product_1 = require("../models/Product");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const inventory = await InventoryItem_1.InventoryItem.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).sort({ createdAt: -1 }).lean();
        // Fetch all products to match by SKU
        const products = await Product_1.Product.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).select('title sku imageUrl category vendor').lean();
        const productMap = new Map(products.map(p => [p.sku, p]));
        const inventoryWithProducts = inventory.map(item => {
            const product = productMap.get(item.sku);
            return {
                ...item,
                product: product ? {
                    title: product.title,
                    imageUrl: product.imageUrl,
                    category: product.category,
                    vendor: product.vendor,
                } : null
            };
        });
        (0, response_1.sendSuccess)(res, inventoryWithProducts);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { available, committed } = req.body;
        const item = await InventoryItem_1.InventoryItem.findOne({
            _id: id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!item) {
            return (0, response_1.sendError)(res, 'Inventory item not found', 404);
        }
        if (available !== undefined)
            item.available = parseInt(available, 10);
        if (committed !== undefined)
            item.committed = parseInt(committed, 10);
        // Recalculate totals
        item.onHand = item.available + item.committed;
        // Transition stock status
        if (item.available === 0) {
            item.status = 'out_of_stock';
        }
        else if (item.available < 15) {
            item.status = 'low_stock';
        }
        else {
            item.status = 'in_stock';
        }
        await item.save();
        (0, response_1.sendSuccess)(res, item, 'Inventory updated successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=inventory.js.map