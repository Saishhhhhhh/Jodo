"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Discount_1 = require("../models/Discount");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const discounts = await Discount_1.Discount.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, discounts);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { code, type, value, status } = req.body;
        // Check if code already exists for this store
        const existing = await Discount_1.Discount.findOne({
            storeId: req.auth.storeId,
            code: code.toUpperCase()
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: { message: 'Discount code already exists', code: 'VALIDATION_ERROR' }
            });
        }
        const discount = await Discount_1.Discount.create({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            code: code.toUpperCase(),
            type,
            value,
            status: status || 'active'
        });
        (0, response_1.sendCreated)(res, discount);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { code, type, value, status } = req.body;
        const discount = await Discount_1.Discount.findOneAndUpdate({ _id: req.params.id, storeId: req.auth.storeId }, {
            $set: {
                ...(code && { code: code.toUpperCase() }),
                ...(type && { type }),
                ...(value !== undefined && { value }),
                ...(status && { status })
            }
        }, { new: true, runValidators: true });
        if (!discount) {
            return res.status(404).json({
                success: false,
                error: { message: 'Discount not found', code: 'NOT_FOUND' }
            });
        }
        (0, response_1.sendSuccess)(res, discount);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const discount = await Discount_1.Discount.findOneAndDelete({
            _id: req.params.id,
            storeId: req.auth.storeId,
        });
        if (!discount) {
            return res.status(404).json({
                success: false,
                error: { message: 'Discount not found', code: 'NOT_FOUND' }
            });
        }
        (0, response_1.sendSuccess)(res, { message: 'Discount deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=discounts.js.map