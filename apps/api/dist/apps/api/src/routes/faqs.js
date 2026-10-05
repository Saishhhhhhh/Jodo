"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FAQ_1 = require("../models/FAQ");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }
        if (req.query.status && req.query.status !== 'All') {
            filter.status = req.query.status;
        }
        if (req.query.q && typeof req.query.q === 'string' && req.query.q.trim()) {
            filter.$or = [
                { question: { $regex: req.query.q.trim(), $options: 'i' } },
                { answer: { $regex: req.query.q.trim(), $options: 'i' } },
                { category: { $regex: req.query.q.trim(), $options: 'i' } },
            ];
        }
        const faqs = await FAQ_1.FAQ.find(filter).sort({ order: 1, createdAt: -1 });
        (0, response_1.sendSuccess)(res, faqs);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const faq = await FAQ_1.FAQ.findById(req.params.id);
        if (!faq)
            return (0, response_1.sendError)(res, 'FAQ not found', 404);
        (0, response_1.sendSuccess)(res, faq);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { question, answer, category, order, status } = req.body;
        if (!question || !answer) {
            return (0, response_1.sendError)(res, 'Question and Answer are required', 400);
        }
        const faq = new FAQ_1.FAQ({
            question: question.trim(),
            answer: answer.trim(),
            category: category ? category.trim() : 'Orders & Delivery',
            order: order !== undefined ? Number(order) : 0,
            status: status || 'active',
        });
        await faq.save();
        (0, response_1.sendSuccess)(res, faq, 'FAQ created successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const faq = await FAQ_1.FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faq)
            return (0, response_1.sendError)(res, 'FAQ not found', 404);
        (0, response_1.sendSuccess)(res, faq, 'FAQ updated successfully');
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/toggle-status', async (req, res, next) => {
    try {
        const faq = await FAQ_1.FAQ.findById(req.params.id);
        if (!faq)
            return (0, response_1.sendError)(res, 'FAQ not found', 404);
        faq.status = faq.status === 'active' ? 'inactive' : 'active';
        await faq.save();
        (0, response_1.sendSuccess)(res, faq, `FAQ status updated to ${faq.status}`);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id', async (req, res, next) => {
    try {
        const faq = await FAQ_1.FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!faq)
            return (0, response_1.sendError)(res, 'FAQ not found', 404);
        (0, response_1.sendSuccess)(res, faq, 'FAQ updated successfully');
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const faq = await FAQ_1.FAQ.findByIdAndDelete(req.params.id);
        if (!faq)
            return (0, response_1.sendError)(res, 'FAQ not found', 404);
        (0, response_1.sendSuccess)(res, null, 'FAQ deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=faqs.js.map