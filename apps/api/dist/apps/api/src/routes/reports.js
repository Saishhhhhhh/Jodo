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
        // 2. Leads & Follow-ups
        const leads = await Lead_1.Lead.find({ tenantId, storeId });
        const dailyLeads = leads.filter(l => new Date(l.createdAt) >= startOfToday);
        const weeklyLeads = leads.filter(l => new Date(l.createdAt) >= startOfWeek);
        const pendingFollowUps = leads.filter(l => l.followUpPriority === 'High' &&
            l.status !== 'Won' &&
            l.status !== 'Lost').length;
        // 3. Inventory
        const lowStockCount = await Product_1.Product.countDocuments({
            tenantId,
            storeId,
            status: 'active',
            inventoryQuantity: { $lte: 15 } // Using 15 as standard fallback threshold
        });
        // 4. Quotations & Support Cases (Stubbed for now as they are not implemented in core schema yet)
        const quotations = { daily: 0, weekly: 0, pending: 0 };
        const supportCases = { daily: 0, weekly: 0, open: 0 };
        const payload = {
            daily: {
                revenue: dailyRevenue,
                orders: dailyOrders.length,
                newLeads: dailyLeads.length,
                quotationsSent: quotations.daily,
                supportCasesOpened: supportCases.daily
            },
            weekly: {
                revenue: weeklyRevenue,
                orders: weeklyOrders.length,
                newLeads: weeklyLeads.length,
                quotationsSent: quotations.weekly,
                supportCasesOpened: supportCases.weekly
            },
            current: {
                pendingFollowUps,
                lowStockItems: lowStockCount,
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
        // Send via Interakt
        const interakt = new interakt_1.InteraktService(tenant.settings.interaktApiKey);
        // Using standard message event since we don't have a specific template name guaranteed for this.
        // In production, we'd use a template: await interakt.sendTemplateMessage(...)
        // For MVP demonstration, we will send an event that can trigger a template in Interakt.
        await interakt.trackEvent({
            userId: tenantId.toString(),
            phoneNumber: targetPhone,
            event: 'Daily_Digest_Generated',
            traits: {
                daily_revenue: dailyRevenue,
                daily_orders: dailyOrders.length,
                daily_leads: dailyLeads,
                pending_followups: pendingFollowUps,
                low_stock_alerts: lowStockCount
            }
        });
        (0, response_1.sendSuccess)(res, null, 'Digest sent successfully via WhatsApp event.');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map