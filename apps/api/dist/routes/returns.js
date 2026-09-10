"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Return_1 = require("../models/Return");
const Order_1 = require("../models/Order");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
/**
 * GET /api/admin/returns
 * List all returns
 */
router.get('/', async (req, res, next) => {
    try {
        const returns = await Return_1.Return.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        })
            .populate('items.productId', 'imageUrl')
            .sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, returns);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/returns/:id
 * Get single return detail
 */
router.get('/:id', async (req, res, next) => {
    try {
        const returnObj = await Return_1.Return.findOne({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).populate('items.productId', 'imageUrl');
        if (!returnObj) {
            return (0, response_1.sendError)(res, 'Return request not found', 404);
        }
        (0, response_1.sendSuccess)(res, returnObj);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/admin/returns
 * Create a new return request for an order
 */
router.post('/', async (req, res, next) => {
    try {
        const { orderId, items, refundAmount, notes } = req.body;
        if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
            return (0, response_1.sendError)(res, 'Order ID and returned items are required', 400);
        }
        const order = await Order_1.Order.findOne({
            _id: orderId,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!order) {
            return (0, response_1.sendError)(res, 'Associated order not found', 404);
        }
        const returnObj = new Return_1.Return({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            orderId,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            items,
            refundAmount: refundAmount || 0,
            notes,
            status: 'requested',
        });
        await returnObj.save();
        // Transition the order's fulfillmentStatus to returned
        order.fulfillmentStatus = 'returned';
        await order.save();
        (0, response_1.sendSuccess)(res, returnObj, 'Return request initiated successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/admin/returns/:id
 * Update status/notes for a return request
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const returnObj = await Return_1.Return.findOne({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!returnObj) {
            return (0, response_1.sendError)(res, 'Return request not found', 404);
        }
        if (status)
            returnObj.status = status;
        if (notes !== undefined)
            returnObj.notes = notes;
        await returnObj.save();
        // If the return is successfully refunded, transition the associated order's payment status to refunded
        if (status === 'refunded') {
            const order = await Order_1.Order.findOne({
                _id: returnObj.orderId,
                tenantId: req.auth.tenantId,
                storeId: req.auth.storeId,
            });
            if (order) {
                order.paymentStatus = 'refunded';
                await order.save();
            }
        }
        (0, response_1.sendSuccess)(res, returnObj, 'Return request updated successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=returns.js.map