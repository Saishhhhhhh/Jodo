"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const { state, type } = req.query;
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        // We should filter by user role, but for now we assume they can see targets if they have access
        // Assuming req.auth.role exists. We can do: query.targetRoles = req.auth.role;
        if (req.auth.role) {
            query.targetRoles = req.auth.role;
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
        if (req.auth.role)
            query.targetRoles = req.auth.role;
        await Notification_1.Notification.updateMany(query, { state: 'read' });
        (0, response_1.sendSuccess)(res, { message: 'All marked as read' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map