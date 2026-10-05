"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const Order_1 = require("../models/Order");
const Lead_1 = require("../models/Lead");
const Product_1 = require("../models/Product");
const interakt_1 = require("../services/interakt");
const Tenant_1 = require("../models/Tenant");
const aiContentService_1 = require("../services/aiContentService");
const router = (0, express_1.Router)();
// Apply auth to all reports routes
router.use(auth_1.requireAuth, auth_1.requireTenant);
/**
 * Helper to calculate start and end of dates
 */
const getStartOfDay = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};
const getStartOfWeek = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay() || 7;
    if (day !== 1)
        d.setHours(-24 * (day - 1));
    return d;
};
/**
 * GET /api/admin/reports/digest
 * Generates Daily and Weekly summaries
 */
router.get('/digest', async (req, res, next) => {
    try {
        const tenantId = req.auth.tenantId;
        const storeId = req.auth.storeId;
        const startOfToday = getStartOfDay();
        const startOfWeek = getStartOfWeek();
        // 1. Sales & Orders
        const orders = await Order_1.Order.find({ tenantId, storeId });
        const dailyOrders = orders.filter(o => new Date(o.createdAt) >= startOfToday);
        const weeklyOrders = orders.filter(o => new Date(o.createdAt) >= startOfWeek);
        const dailyRevenue = dailyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        const weeklyRevenue = weeklyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        const recentOrderDetails = dailyOrders.map(o => ({
            customer: o.customerName || 'Unknown',
            revenue: o.totalAmount,
            items: o.items.map(i => `${i.quantity}x ${i.title}`).join(', ')
        }));
        // 2. Leads & Follow-ups
        const leads = await Lead_1.Lead.find({ tenantId, storeId });
        const dailyLeads = leads.filter(l => new Date(l.createdAt) >= startOfToday);
        const weeklyLeads = leads.filter(l => new Date(l.createdAt) >= startOfWeek);
        const pendingFollowUps = leads.filter(l => l.followUpPriority === 'High' &&
            l.status !== 'Won' &&
            l.status !== 'Lost');
        const recentLeadDetails = dailyLeads.map(l => ({
            name: l.name,
            source: l.source,
            notes: l.notes || 'No notes'
        }));
        // 3. Inventory
        const lowStockProducts = await Product_1.Product.find({
            tenantId,
            storeId,
            status: 'active',
            inventoryQuantity: { $lte: 15 } // Using 15 as standard fallback threshold
        });
        const lowStockDetails = lowStockProducts.map(p => ({
            name: p.title,
            quantity: p.inventoryQuantity,
            sku: p.sku
        }));
        // 4. Quotations & Support Cases (Stubbed for now as they are not implemented in core schema yet)
        const quotations = { daily: 0, weekly: 0, pending: 0 };
        const supportCases = { daily: 0, weekly: 0, open: 0 };
        const payload = {
            daily: {
                revenue: dailyRevenue,
                orders: dailyOrders.length,
                newLeads: dailyLeads.length,
                quotationsSent: quotations.daily,
                supportCasesOpened: supportCases.daily,
                recentOrderDetails,
                recentLeadDetails
            },
            weekly: {
                revenue: weeklyRevenue,
                orders: weeklyOrders.length,
                newLeads: weeklyLeads.length,
                quotationsSent: quotations.weekly,
                supportCasesOpened: supportCases.weekly
            },
            current: {
                pendingFollowUpsCount: pendingFollowUps.length,
                pendingFollowUpNames: pendingFollowUps.map(l => l.name).slice(0, 5),
                lowStockItemsCount: lowStockProducts.length,
                lowStockDetails,
                openSupportCases: supportCases.open,
                pendingQuotations: quotations.pending
            }
        };
        (0, response_1.sendSuccess)(res, payload);
    }
    catch (err) {
        next(err);
    }
});
/**
 * POST /api/admin/reports/generate-ai-summary
 * Generates an AI summary on demand for the current metrics
 */
router.post('/generate-ai-summary', async (req, res, next) => {
    try {
        const { payload } = req.body;
        if (!payload) {
            return (0, response_1.sendError)(res, 'Report data payload is required.', 400);
        }
        const aiResult = await aiContentService_1.AiContentService.generate({
            contentType: 'report_digest',
            reportData: payload,
            tone: 'Professional and Encouraging',
            length: 'Short'
        });
        (0, response_1.sendSuccess)(res, aiResult.content);
    }
    catch (err) {
        next(err);
    }
});
/**
 * POST /api/admin/reports/send-digest
 * Triggers a WhatsApp message with the daily summary
 */
router.post('/send-digest', async (req, res, next) => {
    try {
        const tenantId = req.auth.tenantId;
        const storeId = req.auth.storeId;
        const tenant = await Tenant_1.Tenant.findById(tenantId);
        if (!tenant?.settings?.interaktApiKey) {
            return (0, response_1.sendError)(res, 'Interakt is not configured for this tenant.', 400);
        }
        const { targetPhone } = req.body;
        if (!targetPhone) {
            return (0, response_1.sendError)(res, 'Target phone number is required to send digest.', 400);
        }
        const startOfToday = getStartOfDay();
        // Quick calculate daily metrics
        const dailyOrders = await Order_1.Order.find({ tenantId, storeId, createdAt: { $gte: startOfToday } });
        const dailyRevenue = dailyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        const dailyLeads = await Lead_1.Lead.countDocuments({ tenantId, storeId, createdAt: { $gte: startOfToday } });
        const pendingFollowUps = await Lead_1.Lead.countDocuments({ tenantId, storeId, followUpPriority: 'High', status: { $nin: ['Won', 'Lost'] } });
        const lowStockCount = await Product_1.Product.countDocuments({ tenantId, storeId, status: 'active', inventoryQuantity: { $lte: 15 } });
        // In production, we'd use a template: await InteraktService.sendTemplateMessage(...)
        await interakt_1.InteraktService.sendTemplateMessage(tenant.settings.interaktApiKey, targetPhone, 'daily_digest_template', 'en', [String(dailyRevenue), String(dailyOrders.length), String(dailyLeads), String(pendingFollowUps), String(lowStockCount)]);
        (0, response_1.sendSuccess)(res, null, 'Digest sent successfully via WhatsApp event.');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map