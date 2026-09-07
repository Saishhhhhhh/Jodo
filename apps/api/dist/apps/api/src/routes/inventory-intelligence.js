"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const InventoryItem_1 = require("../models/InventoryItem");
const Product_1 = require("../models/Product");
const Reservation_1 = require("../models/Reservation");
const StockMovement_1 = require("../models/StockMovement");
const InventoryIntelligenceService_1 = require("../services/InventoryIntelligenceService");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/summary', async (req, res, next) => {
    try {
        const { category, location } = req.query;
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        if (location && location !== 'all')
            query.locationName = location;
        if (category && category !== 'all') {
            const products = await Product_1.Product.find({ storeId: req.auth.storeId, category }).select('sku').lean();
            const skus = products.map(p => p.sku);
            query.sku = { $in: skus };
        }
        const inventory = await InventoryItem_1.InventoryItem.find(query).lean();
        // Unique locations across ALL items, not just filtered (so the dropdown still shows all)
        const allInventory = await InventoryItem_1.InventoryItem.find({ tenantId: req.auth.tenantId, storeId: req.auth.storeId }).select('locationName').lean();
        const uniqueLocations = [...new Set(allInventory.map(item => item.locationName).filter(Boolean))];
        let totalProducts = 0;
        let availableStock = 0;
        let reservedStock = 0;
        let lowStockProducts = 0;
        let outOfStockProducts = 0;
        let highDemandProducts = 0; // Using a mock rule for summary API, real API might join with orders
        for (const item of inventory) {
            totalProducts++;
            const stats = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateStockStatus(item);
            availableStock += stats.availableStock;
            reservedStock += (item.reservedStock || 0);
            if (stats.status === 'low_stock')
                lowStockProducts++;
            if (stats.status === 'out_of_stock')
                outOfStockProducts++;
            // Basic mock of high demand for the summary counts
            const mockUnitsSold = Math.floor(Math.random() * 60);
            const demand = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateDemandSignal(mockUnitsSold);
            if (demand === 'High' || demand === 'Very High') {
                highDemandProducts++;
            }
        }
        (0, response_1.sendSuccess)(res, {
            totalProducts,
            availableStock,
            reservedStock,
            lowStockProducts,
            outOfStockProducts,
            highDemandProducts,
            locations: uniqueLocations
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/stock-status', async (req, res, next) => {
    try {
        const { category, location } = req.query;
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        if (location && location !== 'all')
            query.locationName = location;
        if (category && category !== 'all') {
            const products = await Product_1.Product.find({ storeId: req.auth.storeId, category }).select('sku').lean();
            const skus = products.map(p => p.sku);
            query.sku = { $in: skus };
        }
        const inventory = await InventoryItem_1.InventoryItem.find(query).lean();
        let inStock = 0, lowStock = 0, outOfStock = 0, reserved = 0;
        for (const item of inventory) {
            const stats = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateStockStatus(item);
            if (stats.status === 'in_stock')
                inStock++;
            if (stats.status === 'low_stock')
                lowStock++;
            if (stats.status === 'out_of_stock')
                outOfStock++;
            reserved += (item.reservedStock || 0);
        }
        // Normalize reserved as an extra segment or just raw totals
        (0, response_1.sendSuccess)(res, [
            { name: 'In Stock', value: inStock },
            { name: 'Low Stock', value: lowStock },
            { name: 'Out of Stock', value: outOfStock },
            { name: 'Reserved', value: reserved > 0 ? 1 : 0 } // representing category count or actual stock
        ]);
    }
    catch (error) {
        next(error);
    }
});
router.get('/category-summary', async (req, res, next) => {
    try {
        const { location } = req.query;
        // We need product categories
        const products = await Product_1.Product.find({ storeId: req.auth.storeId }).select('sku category').lean();
        const catMap = new Map(products.map(p => [p.sku, p.category || 'Uncategorized']));
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        if (location && location !== 'all')
            query.locationName = location;
        const inventory = await InventoryItem_1.InventoryItem.find(query).lean();
        const catData = {};
        for (const p of products) {
            const cat = p.category || 'Uncategorized';
            if (!catData[cat]) {
                catData[cat] = { name: cat, available: 0, reserved: 0, lowStock: 0 };
            }
        }
        for (const item of inventory) {
            const cat = catMap.get(item.sku) || 'Uncategorized';
            if (!catData[cat]) {
                catData[cat] = { name: cat, available: 0, reserved: 0, lowStock: 0 };
            }
            const stats = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateStockStatus(item);
            catData[cat].available += stats.availableStock;
            catData[cat].reserved += (item.reservedStock || 0);
            if (stats.status === 'low_stock')
                catData[cat].lowStock += 1;
        }
        (0, response_1.sendSuccess)(res, Object.values(catData));
    }
    catch (error) {
        next(error);
    }
});
router.get('/demand-signals', async (req, res, next) => {
    try {
        const { category, location } = req.query;
        let productQuery = { storeId: req.auth.storeId };
        if (category && category !== 'all') {
            productQuery.category = category;
        }
        const products = await Product_1.Product.find(productQuery).lean();
        const invQuery = { storeId: req.auth.storeId };
        if (location && location !== 'all') {
            invQuery.locationName = location;
        }
        const inventory = await InventoryItem_1.InventoryItem.find(invQuery).lean();
        const invMap = new Map(inventory.map(i => [i.sku, i]));
        const result = products.map(p => {
            const item = invMap.get(p.sku) || { onHand: 0, reservedStock: 0, reorderLevel: 10, locationName: 'Unknown' };
            // If location is filtered but the product has no inventory in this location, item will be default.
            // But if we specifically want to filter out items not in the location:
            if (location && location !== 'all' && !invMap.has(p.sku))
                return null;
            const stats = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateStockStatus(item);
            const unitsSold = Math.floor(Math.random() * 80); // Replace with real aggregation
            const demandLevel = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateDemandSignal(unitsSold);
            const estDays = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateEstimatedStockDays(stats.availableStock, unitsSold);
            return {
                _id: p._id,
                title: p.title,
                sku: p.sku,
                imageUrl: p.imageUrl,
                location: item.locationName,
                available: stats.availableStock,
                reserved: item.reservedStock || 0,
                demand: unitsSold, // value for chart
                demandLevel,
                unitsSold,
                estimatedDays
            };
        }).filter(Boolean).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 10);
        (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        next(error);
    }
});
router.get('/attention-required', async (req, res, next) => {
    try {
        const { category, location, status } = req.query;
        let productQuery = { storeId: req.auth.storeId };
        if (category && category !== 'all') {
            productQuery.category = category;
        }
        const products = await Product_1.Product.find(productQuery).select('title sku category').lean();
        const prodMap = new Map(products.map(p => [p.sku, p]));
        let invQuery = { storeId: req.auth.storeId };
        if (location && location !== 'all') {
            invQuery.locationName = location;
        }
        const inventory = await InventoryItem_1.InventoryItem.find(invQuery).lean();
        const results = [];
        for (const item of inventory) {
            const prod = prodMap.get(item.sku);
            if (category && category !== 'all' && !prod)
                continue; // Skip if product doesn't match category
            const stats = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateStockStatus(item);
            if (status && status !== 'all' && stats.status !== status)
                continue; // Skip if status doesn't match
            const unitsSold = Math.floor(Math.random() * 40); // Replace with real data
            const demandLevel = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateDemandSignal(unitsSold);
            const estDays = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateEstimatedStockDays(stats.availableStock, unitsSold);
            const recommendReorder = InventoryIntelligenceService_1.InventoryIntelligenceService.isReorderRecommended(stats.availableStock, demandLevel, estDays);
            if (stats.status === 'out_of_stock' || stats.status === 'low_stock' || recommendReorder || (status && status !== 'all')) {
                results.push({
                    _id: item._id,
                    sku: item.sku,
                    productTitle: prod ? prod.title : 'Unknown',
                    category: prod ? prod.category : 'Unknown',
                    location: item.locationName,
                    totalStock: item.onHand,
                    reserved: item.reservedStock || 0,
                    available: stats.availableStock,
                    reorderLevel: item.reorderLevel || 10,
                    demandLevel,
                    status: stats.status,
                    recommendedAction: recommendReorder ? 'Reorder Now' : (stats.status === 'out_of_stock' ? 'Contact Supplier' : 'Monitor Stock')
                });
            }
        }
        (0, response_1.sendSuccess)(res, results);
    }
    catch (error) {
        next(error);
    }
});
router.get('/stock-movements', async (req, res, next) => {
    try {
        const movements = await StockMovement_1.StockMovement.find({ storeId: req.auth.storeId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('updatedBy', 'name email')
            .lean();
        // Decorate with product titles
        const skus = movements.map(m => m.sku);
        const products = await Product_1.Product.find({ storeId: req.auth.storeId, sku: { $in: skus } }).select('sku title').lean();
        const pMap = new Map(products.map(p => [p.sku, p.title]));
        const result = movements.map(m => ({
            ...m,
            productTitle: pMap.get(m.sku) || m.sku
        }));
        (0, response_1.sendSuccess)(res, result);
    }
    catch (error) {
        next(error);
    }
});
// Reservations
router.get('/reservations', async (req, res, next) => {
    try {
        const reservations = await Reservation_1.Reservation.find({ storeId: req.auth.storeId })
            .sort({ createdAt: -1 })
            .populate('productId', 'title imageUrl')
            .populate('createdBy', 'name')
            .lean();
        (0, response_1.sendSuccess)(res, reservations);
    }
    catch (error) {
        next(error);
    }
});
router.post('/reservations', async (req, res, next) => {
    try {
        const { productId, sku, referenceType, referenceId, reservedQuantity, expiryDate } = req.body;
        const item = await InventoryItem_1.InventoryItem.findOne({ storeId: req.auth.storeId, sku });
        if (!item)
            return (0, response_1.sendError)(res, 'Inventory item not found', 404);
        const stats = InventoryIntelligenceService_1.InventoryIntelligenceService.calculateStockStatus(item);
        if (reservedQuantity > stats.availableStock) {
            return (0, response_1.sendError)(res, 'Requested quantity exceeds available stock', 400);
        }
        const reservation = new Reservation_1.Reservation({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            productId,
            sku,
            referenceType,
            referenceId,
            reservedQuantity,
            status: 'active',
            expiryDate,
            createdBy: req.auth.userId
        });
        await reservation.save();
        // Update inventory item
        item.reservedStock = (item.reservedStock || 0) + reservedQuantity;
        await item.save();
        await StockMovement_1.StockMovement.create({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            sku,
            movementType: 'Stock Reserved',
            quantity: reservedQuantity,
            reference: `${referenceType}-${referenceId}`,
            updatedBy: req.auth.userId
        });
        (0, response_1.sendSuccess)(res, reservation, 'Stock reservation created successfully');
    }
    catch (error) {
        next(error);
    }
});
router.patch('/reservations/:id/release', async (req, res, next) => {
    try {
        const reservation = await Reservation_1.Reservation.findOne({ _id: req.params.id, storeId: req.auth.storeId });
        if (!reservation)
            return (0, response_1.sendError)(res, 'Reservation not found', 404);
        if (reservation.status !== 'active')
            return (0, response_1.sendError)(res, 'Reservation is not active', 400);
        reservation.status = 'released';
        await reservation.save();
        const item = await InventoryItem_1.InventoryItem.findOne({ storeId: req.auth.storeId, sku: reservation.sku });
        if (item) {
            item.reservedStock = Math.max(0, (item.reservedStock || 0) - reservation.reservedQuantity);
            await item.save();
        }
        await StockMovement_1.StockMovement.create({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            sku: reservation.sku,
            movementType: 'Reservation Released',
            quantity: reservation.reservedQuantity,
            reference: `${reservation.referenceType}-${reservation.referenceId}`,
            updatedBy: req.auth.userId
        });
        (0, response_1.sendSuccess)(res, reservation, 'Reservation released');
    }
    catch (error) {
        next(error);
    }
});
router.patch('/reservations/:id/convert', async (req, res, next) => {
    try {
        const reservation = await Reservation_1.Reservation.findOne({ _id: req.params.id, storeId: req.auth.storeId });
        if (!reservation)
            return (0, response_1.sendError)(res, 'Reservation not found', 404);
        if (reservation.status !== 'active')
            return (0, response_1.sendError)(res, 'Reservation is not active', 400);
        reservation.status = 'converted';
        await reservation.save();
        const item = await InventoryItem_1.InventoryItem.findOne({ storeId: req.auth.storeId, sku: reservation.sku });
        if (item) {
            item.reservedStock = Math.max(0, (item.reservedStock || 0) - reservation.reservedQuantity);
            item.onHand = Math.max(0, item.onHand - reservation.reservedQuantity); // actual stock drops
            await item.save();
        }
        await StockMovement_1.StockMovement.create({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            sku: reservation.sku,
            movementType: 'Order Confirmed',
            quantity: -reservation.reservedQuantity, // Reduced stock
            reference: `${reservation.referenceType}-${reservation.referenceId}`,
            updatedBy: req.auth.userId
        });
        (0, response_1.sendSuccess)(res, reservation, 'Reservation converted');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=inventory-intelligence.js.map