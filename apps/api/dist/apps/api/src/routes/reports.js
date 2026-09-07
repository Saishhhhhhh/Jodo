"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Order_1 = require("../models/Order");
const Customer_1 = require("../models/Customer");
const InventoryItem_1 = require("../models/InventoryItem");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
// Define Report schema and model inline if not created separately, or we can just create it.
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
const Report = mongoose_1.default.models.Report || mongoose_1.default.model('Report', reportSchema);
// GET /api/reports/summary
router.get('/summary', auth_1.requireAuth, async (req, res) => {
    try {
        const { from, to } = req.query;
        // req.auth is set by requireAuth middleware
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth?.tenantId);
        const storeId = new mongoose_1.default.Types.ObjectId(req.auth?.storeId || req.auth?.tenantId);
        let dateFilter = {};
        if (from && to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            dateFilter.createdAt = {
                $gte: new Date(from),
                $lte: toDate
            };
        }
        const baseFilter = { tenantId, storeId, ...dateFilter };
        // Sales Summary
        const salesAgg = await Order_1.Order.aggregate([
            { $match: { ...baseFilter, status: { $ne: 'draft' } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);
        const sales = salesAgg[0] || { totalRevenue: 0, count: 0 };
        // Quotations (Draft orders)
        const quotationsCount = await Order_1.Order.countDocuments({ ...baseFilter, status: 'draft' });
        // Orders Summary
        const ordersAgg = await Order_1.Order.aggregate([
            { $match: { ...baseFilter, status: { $ne: 'draft' } } },
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
        ]);
        const ordersByStatus = ordersAgg.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});
        // Leads (Customers created)
        const leadsCount = await Customer_1.Customer.countDocuments(baseFilter);
        // Inventory
        const inventoryAgg = await InventoryItem_1.InventoryItem.aggregate([
            { $match: { tenantId, storeId } }, // typically inventory is not date-bound for summary
            { $group: { _id: null, totalQuantity: { $sum: "$available" }, count: { $sum: 1 } } }
        ]);
        const inventory = inventoryAgg[0] || { totalQuantity: 0, count: 0 };
        res.json({
            sales: {
                totalRevenue: sales.totalRevenue,
                totalOrders: sales.count,
            },
            leads: {
                total: leadsCount,
            },
            inventory: {
                totalItems: inventory.count,
                totalQuantity: inventory.totalQuantity,
            },
            quotations: {
                total: quotationsCount,
            },
            orders: {
                total: sales.count,
                byStatus: ordersByStatus,
            },
            supportCases: { total: 0, open: 0, resolved: 0 },
            followUps: { pending: 0, overdue: 0 }
        });
    }
    catch (error) {
        console.error('Error fetching report summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/reports/history
router.get('/history', auth_1.requireAuth, async (req, res) => {
    try {
        const storeId = new mongoose_1.default.Types.ObjectId(req.auth?.storeId || req.auth?.tenantId);
        const reports = await Report.find({ storeId }).sort({ createdAt: -1 }).limit(50);
        res.json(reports);
    }
    catch (error) {
        console.error('Error fetching report history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/reports/:id
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const storeId = new mongoose_1.default.Types.ObjectId(req.auth?.storeId || req.auth?.tenantId);
        const report = await Report.findOne({ _id: req.params.id, storeId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json(report);
    }
    catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/reports/generate
router.post('/generate', auth_1.requireAuth, async (req, res) => {
    try {
        const { from, to, type } = req.body;
        const storeId = new mongoose_1.default.Types.ObjectId(req.auth?.storeId || req.auth?.tenantId);
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth?.tenantId);
        let dateFilter = {};
        if (from && to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            dateFilter.createdAt = {
                $gte: new Date(from),
                $lte: toDate
            };
        }
        const baseFilter = { tenantId, storeId, ...dateFilter };
        const salesAgg = await Order_1.Order.aggregate([
            { $match: { ...baseFilter, status: { $ne: 'draft' } } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
        ]);
        const sales = salesAgg[0] || { totalRevenue: 0, count: 0 };
        const quotationsCount = await Order_1.Order.countDocuments({ ...baseFilter, status: 'draft' });
        const ordersAgg = await Order_1.Order.aggregate([
            { $match: { ...baseFilter, status: { $ne: 'draft' } } },
            { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
        ]);
        const ordersByStatus = ordersAgg.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});
        const leadsCount = await Customer_1.Customer.countDocuments(baseFilter);
        const inventoryAgg = await InventoryItem_1.InventoryItem.aggregate([
            { $match: { tenantId, storeId } },
            { $group: { _id: null, totalQuantity: { $sum: "$available" }, count: { $sum: 1 } } }
        ]);
        const inventory = inventoryAgg[0] || { totalQuantity: 0, count: 0 };
        const data = {
            sales: { totalRevenue: sales.totalRevenue, totalOrders: sales.count },
            leads: { total: leadsCount },
            inventory: { totalItems: inventory.count, totalQuantity: inventory.totalQuantity },
            quotations: { total: quotationsCount },
            orders: { total: sales.count, byStatus: ordersByStatus },
            supportCases: { total: 0, open: 0, resolved: 0 },
            followUps: { pending: 0, overdue: 0 },
            details: {
                orders: await Order_1.Order.find({ ...baseFilter, status: { $ne: 'draft' } })
                    .select('orderNumber customerName totalAmount paymentStatus createdAt')
                    .sort({ createdAt: -1 }).limit(100),
                quotations: await Order_1.Order.find({ ...baseFilter, status: 'draft' })
                    .select('orderNumber customerName totalAmount createdAt')
                    .sort({ createdAt: -1 }).limit(100),
                leads: await Customer_1.Customer.find(baseFilter)
                    .select('firstName lastName email createdAt')
                    .sort({ createdAt: -1 }).limit(100),
                inventory: await InventoryItem_1.InventoryItem.find({ tenantId, storeId })
                    .select('sku available reserved')
                    .sort({ available: 1 }).limit(100)
            }
        };
        const report = new Report({
            tenantId,
            storeId,
            name: `Generated Report - ${type}`,
            type: type || 'custom',
            dateRange: { from: new Date(from), to: new Date(to) },
            status: 'completed',
            data
        });
        await report.save();
        res.json(report);
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/reports/:id
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const storeId = new mongoose_1.default.Types.ObjectId(req.auth?.storeId || req.auth?.tenantId);
        const result = await Report.deleteOne({ _id: req.params.id, storeId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }
        res.json({ message: 'Report deleted' });
    }
    catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map