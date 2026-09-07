"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Order_1 = require("../models/Order");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const filter = {
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        };
        if (req.query.status) {
            filter.status = req.query.status;
        }
        const orders = await Order_1.Order.find(filter).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, orders);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { customerName, customerEmail, items, shippingAddress } = req.body;
        if (!items || !items.length) {
            return (0, response_1.sendError)(res, 'Order must contain at least one item', 400);
        }
        // Calculate totals
        let subtotal = 0;
        let itemsCount = 0;
        const orderItems = items.map((item) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            itemsCount += item.quantity;
            return {
                productId: item.productId,
                sku: item.sku || 'N/A',
                title: item.title,
                quantity: item.quantity,
                price: item.price,
                total: itemTotal,
            };
        });
        const taxTotal = 0; // Simple for now
        const shippingTotal = 0; // Simple for now
        const totalAmount = subtotal + taxTotal + shippingTotal;
        // Generate order number
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const orderNumber = `DRAFT-${randomSuffix}`;
        const order = new Order_1.Order({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            orderNumber,
            customerName: customerName || 'Unknown Customer',
            customerEmail: customerEmail || 'unknown@example.com',
            items: orderItems,
            shippingAddress,
            subtotal,
            taxTotal,
            shippingTotal,
            totalAmount,
            itemsCount,
            status: 'draft',
            paymentStatus: 'pending',
            fulfillmentStatus: 'unfulfilled',
        });
        await order.save();
        (0, response_1.sendSuccess)(res, order, 'Draft order created successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const order = await Order_1.Order.findOne({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        }).populate('items.productId', 'imageUrl');
        if (!order) {
            return (0, response_1.sendError)(res, 'Order not found', 404);
        }
        (0, response_1.sendSuccess)(res, order);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { paymentStatus, fulfillmentStatus, notes, fraudStatus, status } = req.body;
        const order = await Order_1.Order.findOne({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!order) {
            return (0, response_1.sendError)(res, 'Order not found', 404);
        }
        if (paymentStatus)
            order.paymentStatus = paymentStatus;
        if (fulfillmentStatus)
            order.fulfillmentStatus = fulfillmentStatus;
        if (notes !== undefined)
            order.notes = notes;
        if (fraudStatus)
            order.fraudStatus = fraudStatus;
        if (status)
            order.status = status;
        await order.save();
        (0, response_1.sendSuccess)(res, order, 'Order updated successfully');
    }
    catch (error) {
        next(error);
    }
});
router.post('/:id/fulfill', async (req, res, next) => {
    try {
        const { carrier, trackingNumber, trackingUrl, notifyCustomer } = req.body;
        if (!carrier || !trackingNumber) {
            return (0, response_1.sendError)(res, 'Carrier and tracking number are required', 400);
        }
        const order = await Order_1.Order.findOne({
            _id: req.params.id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!order) {
            return (0, response_1.sendError)(res, 'Order not found', 404);
        }
        if (!order.fulfillments) {
            order.fulfillments = [];
        }
        order.fulfillments.push({
            carrier,
            trackingNumber,
            trackingUrl,
            notifyCustomer,
            createdAt: new Date(),
        });
        order.fulfillmentStatus = 'fulfilled';
        await order.save();
        // In a real application, you would send an email here if notifyCustomer is true
        (0, response_1.sendSuccess)(res, order, 'Order fulfilled successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map