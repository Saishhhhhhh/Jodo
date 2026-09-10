"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const AppPlugin_1 = require("../models/AppPlugin");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const apps = await AppPlugin_1.AppPlugin.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, apps);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=apps.js.map