"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Campaign_1 = require("../models/Campaign");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const campaigns = await Campaign_1.Campaign.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, campaigns);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { name, type, status, budget, startDate, endDate } = req.body;
        const campaign = await Campaign_1.Campaign.create({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            name,
            type,
            status: status || 'draft',
            budget,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : undefined,
        });
        (0, response_1.sendSuccess)(res, campaign, 201);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { name, type, status, budget, startDate, endDate } = req.body;
        const campaign = await Campaign_1.Campaign.findOneAndUpdate({ _id: req.params.id, storeId: req.auth.storeId }, {
            $set: {
                ...(name && { name }),
                ...(type && { type }),
                ...(status && { status }),
                ...(budget !== undefined && { budget }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : undefined })
            }
        }, { new: true, runValidators: true });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: { message: 'Campaign not found', code: 'NOT_FOUND' }
            });
        }
        (0, response_1.sendSuccess)(res, campaign);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const campaign = await Campaign_1.Campaign.findOneAndDelete({
            _id: req.params.id,
            storeId: req.auth.storeId,
        });
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: { message: 'Campaign not found', code: 'NOT_FOUND' }
            });
        }
        (0, response_1.sendSuccess)(res, { message: 'Campaign deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=campaigns.js.map