"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Customer_1 = require("../models/Customer");
const Store_1 = require("../models/Store");
const Order_1 = require("../models/Order");
const response_1 = require("../utils/response");
const jwt_1 = require("../utils/jwt");
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
        const token = (0, jwt_1.signAccessToken)({
            sub: customer._id.toString(),
            tenantId: customer.tenantId.toString(),
            storeId: customer.storeId.toString(),
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
        });
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
        const token = (0, jwt_1.signAccessToken)({
            sub: customer._id.toString(),
            tenantId: customer.tenantId.toString(),
            storeId: customer.storeId.toString(),
            email: customer.email,
            name: `${customer.firstName} ${customer.lastName}`,
        });
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
        (0, response_1.sendSuccess)(res, { orders }, 'Orders retrieved successfully');
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
        (0, response_1.sendSuccess)(res, { order }, 'Order retrieved successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=storefront-auth.js.map