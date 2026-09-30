"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const Tenant_1 = require("../models/Tenant");
const Store_1 = require("../models/Store");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
// Apply auth to all notification routes with dev fallback
router.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] !== 'undefined' && authHeader.split(' ')[1] !== 'null') {
        return (0, auth_1.requireAuth)(req, res, () => (0, auth_1.requireTenant)(req, res, next));
    }
    // Graceful fallback on local dev: use seeded tenant and store
    try {
        const tenant = await Tenant_1.Tenant.findOne();
        const store = await Store_1.Store.findOne({ tenantId: tenant?._id });
        if (tenant && store) {
            req.auth = {
                sub: 'dev-admin',
                tenantId: String(tenant._id),
                storeId: String(store._id),
                email: 'admin@jodo.dev',
                name: 'Admin',
                type: 'access',
            };
            return next();
        }
    }
    catch {
        // continue to requireAuth
    }
    return (0, auth_1.requireAuth)(req, res, next);
});
router.get('/', async (req, res, next) => {
    try {
        const { state, type } = req.query;
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        const userRole = req.auth?.role;
        // Admin, owner and dev-admin see all notifications
        if (userRole && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'dev-admin') {
            query.targetRoles = userRole;
        }
        if (state && state !== 'all') {
            query.state = state;
        }
        else {
            query.state = { $ne: 'resolved' }; // by default don't show resolved
        }
        if (type) {
            query.type = type;
        }
        const notifications = await Notification_1.Notification.find(query).sort({ createdAt: -1 }).limit(50).lean();
        (0, response_1.sendSuccess)(res, notifications);
    }
    catch (error) {
        next(error);
    }
});
router.get('/unread-count', async (req, res, next) => {
    try {
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            state: 'unread',
        };
        const userRole = req.auth?.role;
        if (userRole && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'dev-admin') {
            query.targetRoles = userRole;
        }
        const count = await Notification_1.Notification.countDocuments(query);
        (0, response_1.sendSuccess)(res, { count });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/read', async (req, res, next) => {
    try {
        const notif = await Notification_1.Notification.findOneAndUpdate({ _id: req.params.id, storeId: req.auth.storeId }, { state: 'read' }, { new: true });
        (0, response_1.sendSuccess)(res, notif);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/dismiss', async (req, res, next) => {
    try {
        const notif = await Notification_1.Notification.findOneAndUpdate({ _id: req.params.id, storeId: req.auth.storeId }, { state: 'dismissed' }, { new: true });
        (0, response_1.sendSuccess)(res, notif);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/read-all', async (req, res, next) => {
    try {
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            state: 'unread'
        };
        const userRole = req.auth?.role;
        if (userRole && userRole !== 'admin' && userRole !== 'owner' && userRole !== 'dev-admin') {
            query.targetRoles = userRole;
        }
        await Notification_1.Notification.updateMany(query, { state: 'read' });
        (0, response_1.sendSuccess)(res, { message: 'All marked as read' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map