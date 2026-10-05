"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Customer_1 = require("../models/Customer");
const Store_1 = require("../models/Store");
const Order_1 = require("../models/Order");
const Return_1 = require("../models/Return");
const response_1 = require("../utils/response");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
// Registration Route
router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return (0, response_1.sendError)(res, 'All fields are required', 400);
        }
        // Since this is a storefront, we fetch the default store
        const store = await Store_1.Store.findOne();
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not configured', 500);
        }
        const existingCustomer = await Customer_1.Customer.findOne({ email, storeId: store._id });
        if (existingCustomer) {
            return (0, response_1.sendError)(res, 'An account with this email already exists', 400);
        }
        const customer = new Customer_1.Customer({
            tenantId: store.tenantId,
            storeId: store._id,
            firstName,
            lastName,
            email,
            passwordHash: password, // The pre-save hook will hash this!
        });
        await customer.save();
        const token = jsonwebtoken_1.default.sign({
            sub: customer._id.toString(),
            tenantId: customer.tenantId?.toString() || '',
            storeId: customer.storeId?.toString() || '',
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
            type: 'access',
        }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: '30d' });
        (0, response_1.sendSuccess)(res, { token, customer }, 'Registration successful');
    }
    catch (error) {
        next(error);
    }
});
// Login Route
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, response_1.sendError)(res, 'Email and password are required', 400);
        }
        const store = await Store_1.Store.findOne();
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not configured', 500);
        }
        const customer = await Customer_1.Customer.findOne({ email, storeId: store._id }).select('+passwordHash');
        if (!customer) {
            return (0, response_1.sendError)(res, 'Invalid email or password', 401);
        }
        if (!customer.passwordHash) {
            return (0, response_1.sendError)(res, 'This account cannot be logged in with a password. Please contact support.', 401);
        }
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return (0, response_1.sendError)(res, 'Invalid email or password', 401);
        }
        const token = jsonwebtoken_1.default.sign({
            sub: customer._id.toString(),
            tenantId: customer.tenantId?.toString() || '',
            storeId: customer.storeId?.toString() || '',
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
            type: 'access',
        }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: '30d' });
        // Remove passwordHash from response
        customer.passwordHash = undefined;
        (0, response_1.sendSuccess)(res, { token, customer }, 'Login successful');
    }
    catch (error) {
        next(error);
    }
});
// Get Current Customer
router.get('/me', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Unauthorized', 401);
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
        }
        const customer = await Customer_1.Customer.findById(decoded.sub);
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        (0, response_1.sendSuccess)(res, { customer }, 'Customer retrieved successfully');
    }
    catch (error) {
        next(error);
    }
});
// Update Current Customer Profile
router.put('/me', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Unauthorized', 401);
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
        }
        const { firstName, lastName, phone, defaultShippingAddress } = req.body;
        const customer = await Customer_1.Customer.findById(decoded.sub);
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        if (firstName)
            customer.firstName = firstName;
        if (lastName)
            customer.lastName = lastName;
        if (phone !== undefined)
            customer.phone = phone; // Allow clearing phone
        if (defaultShippingAddress) {
            customer.defaultShippingAddress = defaultShippingAddress;
        }
        await customer.save();
        (0, response_1.sendSuccess)(res, { customer }, 'Profile updated successfully');
    }
    catch (error) {
        next(error);
    }
});
// Change Password
router.put('/me/password', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Unauthorized', 401);
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return (0, response_1.sendError)(res, 'Current and new password are required', 400);
        }
        if (newPassword.length < 6) {
            return (0, response_1.sendError)(res, 'New password must be at least 6 characters', 400);
        }
        const customer = await Customer_1.Customer.findById(decoded.sub).select('+passwordHash');
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        const isMatch = await customer.comparePassword(currentPassword);
        if (!isMatch) {
            return (0, response_1.sendError)(res, 'Incorrect current password', 400);
        }
        // Assign new password, pre-save hook will hash it
        customer.passwordHash = newPassword;
        await customer.save();
        (0, response_1.sendSuccess)(res, null, 'Password updated successfully');
    }
    catch (error) {
        next(error);
    }
});
// Get Current Customer Orders
router.get('/me/orders', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Unauthorized', 401);
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
        }
        const customer = await Customer_1.Customer.findById(decoded.sub);
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        // Find orders where customerEmail matches the logged-in customer
        const orders = await Order_1.Order.find({ customerEmail: customer.email })
            .sort({ createdAt: -1 }) // Newest first
            .populate('items.productId', 'imageUrl');
        const orderIds = orders.map((o) => o._id);
        const orderNumbers = orders.map((o) => o.orderNumber);
        const returns = await Return_1.Return.find({
            $or: [
                { orderId: { $in: orderIds } },
                { orderNumber: { $in: orderNumbers } },
            ],
        });
        const returnsByOrder = new Map();
        returns.forEach((r) => {
            if (r.orderId)
                returnsByOrder.set(r.orderId.toString(), r.status);
            if (r.orderNumber)
                returnsByOrder.set(r.orderNumber, r.status);
        });
        const ordersWithReturns = orders.map((o) => {
            const plain = o.toObject();
            plain.returnStatus = returnsByOrder.get(o._id.toString()) || returnsByOrder.get(o.orderNumber) || null;
            return plain;
        });
        (0, response_1.sendSuccess)(res, { orders: ordersWithReturns }, 'Orders retrieved successfully');
    }
    catch (error) {
        next(error);
    }
});
// Get Single Customer Order
router.get('/me/orders/:id', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Unauthorized', 401);
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
        }
        const customer = await Customer_1.Customer.findById(decoded.sub);
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        const order = await Order_1.Order.findOne({
            _id: req.params.id,
            customerEmail: customer.email
        }).populate('items.productId', 'imageUrl name description');
        if (!order) {
            return (0, response_1.sendError)(res, 'Order not found', 404);
        }
        const returnRequest = await Return_1.Return.findOne({
            $or: [
                { orderId: order._id },
                { orderNumber: order.orderNumber }
            ]
        }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, { order, returnRequest }, 'Order retrieved successfully');
    }
    catch (error) {
        next(error);
    }
});
// Submit Return / Issue for Order
router.post('/me/orders/:id/returns', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Unauthorized', 401);
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        }
        catch (err) {
            return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
        }
        const customer = await Customer_1.Customer.findById(decoded.sub);
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        const order = await Order_1.Order.findOne({
            _id: req.params.id,
            customerEmail: customer.email
        });
        if (!order) {
            return (0, response_1.sendError)(res, 'Order not found', 404);
        }
        const { items, issueType, details, images } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return (0, response_1.sendError)(res, 'Please select at least one item having issues', 400);
        }
        // Handle base64 image uploads
        const imageUrls = [];
        if (images && Array.isArray(images)) {
            const fs = require('fs');
            const path = require('path');
            const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
            if (!fs.existsSync(UPLOADS_DIR)) {
                fs.mkdirSync(UPLOADS_DIR, { recursive: true });
            }
            for (const base64Str of images) {
                try {
                    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                        const data = Buffer.from(matches[2], 'base64');
                        const uniqueFilename = `return-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
                        const filePath = path.join(UPLOADS_DIR, uniqueFilename);
                        fs.writeFileSync(filePath, data);
                        imageUrls.push(`/uploads/${uniqueFilename}`);
                    }
                }
                catch (e) {
                    console.error('Failed to process base64 image on return', e);
                }
            }
        }
        const returnObj = new Return_1.Return({
            tenantId: order.tenantId,
            storeId: order.storeId,
            orderId: order._id,
            orderNumber: order.orderNumber,
            customerName: order.customerName || `${customer.firstName} ${customer.lastName}`,
            customerEmail: order.customerEmail || customer.email,
            items: items.map((it) => ({
                productId: it.productId,
                sku: it.sku || 'SKU-GEN',
                title: it.title,
                quantity: it.quantity || 1,
                price: it.price || 0,
                reason: 'other',
            })),
            refundAmount: order.totalAmount || 0,
            notes: `[Issue Type: ${issueType || 'Standard Return'}] ${details || ''}`.trim(),
            images: imageUrls,
            status: 'requested',
        });
        await returnObj.save();
        order.fulfillmentStatus = 'returned';
        await order.save();
        (0, response_1.sendSuccess)(res, { return: returnObj }, 'Return request submitted successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=storefront-auth.js.map