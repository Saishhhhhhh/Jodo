"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Lead_1 = require("../models/Lead");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// GET all leads with optional filtering
router.get('/', async (req, res, next) => {
    try {
        const { status, priority, source, search } = req.query;
        const query = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        if (status)
            query.status = status;
        if (priority)
            query.followUpPriority = priority;
        if (source)
            query.source = source;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }
        const leads = await Lead_1.Lead.find(query).sort({ createdAt: -1 }).lean();
        (0, response_1.sendSuccess)(res, leads);
    }
    catch (error) {
        next(error);
    }
});
// POST a new lead
router.post('/', async (req, res, next) => {
    try {
        const leadData = {
            ...req.body,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        const lead = new Lead_1.Lead(leadData);
        await lead.save();
        (0, response_1.sendSuccess)(res, lead, 'Lead created successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
// PUT update a lead
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const lead = await Lead_1.Lead.findOneAndUpdate({ _id: id, tenantId: req.auth.tenantId, storeId: req.auth.storeId }, { $set: req.body }, { new: true, runValidators: true });
        if (!lead) {
            return (0, response_1.sendError)(res, 'Lead not found', 404);
        }
        (0, response_1.sendSuccess)(res, lead, 'Lead updated successfully');
    }
    catch (error) {
        next(error);
    }
});
// DELETE a lead
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const lead = await Lead_1.Lead.findOneAndDelete({
            _id: id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!lead) {
            return (0, response_1.sendError)(res, 'Lead not found', 404);
        }
        (0, response_1.sendSuccess)(res, null, 'Lead deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=leads.js.map