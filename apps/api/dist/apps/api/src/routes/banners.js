"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Banner_1 = require("../models/Banner");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const banners = await Banner_1.Banner.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).sort({ order: 1, createdAt: -1 });
        (0, response_1.sendSuccess)(res, banners);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const banner = new Banner_1.Banner({
            ...req.body,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        await banner.save();
        (0, response_1.sendSuccess)(res, banner, 'Banner created successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const banner = await Banner_1.Banner.findOneAndUpdate({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }, req.body, { new: true, runValidators: true });
        if (!banner)
            return (0, response_1.sendError)(res, 'Banner not found', 404);
        (0, response_1.sendSuccess)(res, banner, 'Banner updated successfully');
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const banner = await Banner_1.Banner.findOneAndDelete({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!banner)
            return (0, response_1.sendError)(res, 'Banner not found', 404);
        (0, response_1.sendSuccess)(res, null, 'Banner deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=banners.js.map