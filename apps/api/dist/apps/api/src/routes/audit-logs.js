"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const AuditLog_1 = require("../models/AuditLog");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const auditLogs = await AuditLog_1.AuditLog.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        })
            .populate('actorUserId', 'name email')
            .sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, auditLogs);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=audit-logs.js.map