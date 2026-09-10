"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Navigation_1 = require("../models/Navigation");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const menus = await Navigation_1.Navigation.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, menus);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { title, handle, items } = req.body;
        // Check if handle already exists for this store
        const existing = await Navigation_1.Navigation.findOne({
            storeId: req.auth.storeId,
            handle,
        });
        if (existing) {
            return (0, response_1.sendError)(res, 'A menu with this handle already exists', 400);
        }
        const menu = new Navigation_1.Navigation({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            title,
            handle,
            items: items || [],
        });
        await menu.save();
        (0, response_1.sendSuccess)(res, menu, 'Menu created successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const menu = await Navigation_1.Navigation.findOne({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!menu)
            return (0, response_1.sendError)(res, 'Menu not found', 404);
        (0, response_1.sendSuccess)(res, menu);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { title, handle, items } = req.body;
        // Check handle collision if handle is changed
        if (handle) {
            const existing = await Navigation_1.Navigation.findOne({
                storeId: req.auth.storeId,
                handle,
                _id: { $ne: req.params.id },
            });
            if (existing) {
                return (0, response_1.sendError)(res, 'A menu with this handle already exists', 400);
            }
        }
        const menu = await Navigation_1.Navigation.findOneAndUpdate({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }, { $set: { title, handle, items } }, { new: true, runValidators: true });
        if (!menu)
            return (0, response_1.sendError)(res, 'Menu not found', 404);
        (0, response_1.sendSuccess)(res, menu, 'Menu updated successfully');
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const menu = await Navigation_1.Navigation.findOneAndDelete({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!menu)
            return (0, response_1.sendError)(res, 'Menu not found', 404);
        (0, response_1.sendSuccess)(res, null, 'Menu deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=navigation.js.map