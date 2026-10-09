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
const EmailVerification_1 = require("../models/EmailVerification");
const emailService_1 = require("../services/emailService");
const crypto_1 = require("../utils/crypto");
const response_1 = require("../utils/response");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const router = (0, express_1.Router)();
// Helper to sign customer JWT token
function generateCustomerToken(customer) {
    return jsonwebtoken_1.default.sign({
        sub: customer._id.toString(),
        tenantId: customer.tenantId?.toString() || '',
        storeId: customer.storeId?.toString() || '',
        email: customer.email,
        name: `${customer.firstName} ${customer.lastName}`,
        type: 'access',
    }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: '30d' });
}
// ============================================================
// Registration Route with Email Verification
// ============================================================
router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return (0, response_1.sendError)(res, 'All fields are required', 400);
        }
        const cleanEmail = email.trim().toLowerCase();
        // Basic email format validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return (0, response_1.sendError)(res, 'Please provide a valid email address', 400);
        }
        if (password.length < 6) {
            return (0, response_1.sendError)(res, 'Password must be at least 6 characters long', 400);
        }
        // Fetch the default store
        const store = await Store_1.Store.findOne();
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not configured', 500);
        }
        const existingCustomer = await Customer_1.Customer.findOne({ email: cleanEmail, storeId: store._id });
        if (existingCustomer) {
            return (0, response_1.sendError)(res, 'An account with this email already exists', 400);
        }
        // Create customer account (all customers must verify their email address)
        const customer = new Customer_1.Customer({
            tenantId: store.tenantId,
            storeId: store._id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: cleanEmail,
            passwordHash: password, // The pre-save hook will hash this
            isEmailVerified: false,
            emailVerifiedAt: null,
        });
        await customer.save();
        // Invalidate old OTPs for this email if any
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        // Generate fresh 6-digit OTP
        const otp = (0, crypto_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await EmailVerification_1.EmailVerification.create({
            customerId: customer._id,
            email: cleanEmail,
            otpHash: (0, crypto_1.hashOtp)(otp),
            expiresAt,
            attemptCount: 0,
            lastSentAt: new Date(),
            resendCount: 0,
        });
        try {
            await emailService_1.emailService.sendVerificationOtp({
                email: cleanEmail,
                otp,
                customerName: customer.firstName,
                tenantId: customer.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[StorefrontAuth] Failed to dispatch verification email on registration:', mailErr);
        }
        customer.passwordHash = undefined;
        (0, response_1.sendSuccess)(res, {
            requiresVerification: true,
            email: customer.email,
            maskedEmail: (0, crypto_1.maskEmail)(customer.email),
            customer: {
                id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
            },
        }, 'Account created successfully. A verification code has been sent to your email.');
    }
    catch (error) {
        next(error);
    }
});
// ============================================================
// Login Route with Email Verification Gate
// ============================================================
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return (0, response_1.sendError)(res, 'Email and password are required', 400);
        }
        const cleanEmail = email.trim().toLowerCase();
        const store = await Store_1.Store.findOne();
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not configured', 500);
        }
        // Authenticate credentials FIRST before revealing any account state
        const customer = await Customer_1.Customer.findOne({ email: cleanEmail, storeId: store._id }).select('+passwordHash');
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
        // Check email verification gate
        if (!customer.isEmailVerified) {
            // Invalidate old OTPs and send a fresh verification OTP
            await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
            const otp = (0, crypto_1.generateOtp)();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await EmailVerification_1.EmailVerification.create({
                customerId: customer._id,
                email: cleanEmail,
                otpHash: (0, crypto_1.hashOtp)(otp),
                expiresAt,
                attemptCount: 0,
                lastSentAt: new Date(),
                resendCount: 0,
            });
            try {
                await emailService_1.emailService.sendVerificationOtp({
                    email: cleanEmail,
                    otp,
                    customerName: customer.firstName,
                    tenantId: customer.tenantId,
                });
            }
            catch (mailErr) {
                console.error('[StorefrontAuth] Failed to dispatch verification email on login:', mailErr);
            }
            return res.status(200).json({
                success: false,
                requiresVerification: true,
                message: 'Please verify your email address to continue.',
                data: {
                    email: customer.email,
                    maskedEmail: (0, crypto_1.maskEmail)(customer.email),
                    requiresVerification: true,
                },
            });
        }
        // Account is verified: issue full authenticated session
        const token = generateCustomerToken(customer);
        customer.passwordHash = undefined;
        (0, response_1.sendSuccess)(res, { token, customer }, 'Login successful');
    }
    catch (error) {
        next(error);
    }
});
// ============================================================
// Verify Email OTP Route
// ============================================================
router.post('/verify-otp', async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return (0, response_1.sendError)(res, 'Email and 6-digit verification code are required', 400);
        }
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = String(otp).trim();
        if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
            return (0, response_1.sendError)(res, 'Verification code must be exactly 6 digits', 400);
        }
        // Find the latest active verification record for this email
        const record = await EmailVerification_1.EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
        if (!record) {
            return (0, response_1.sendError)(res, 'No active verification code found for this email. Please request a new one.', 400);
        }
        // Check expiration
        if (new Date() > new Date(record.expiresAt)) {
            return (0, response_1.sendError)(res, 'Verification code has expired. Please request a new one.', 400);
        }
        // Check attempt limit
        if (record.attemptCount >= 5) {
            return (0, response_1.sendError)(res, 'Too many incorrect attempts. Please request a new verification code.', 429);
        }
        // Compare hashed OTP
        const hashedInput = (0, crypto_1.hashOtp)(cleanOtp);
        if (hashedInput !== record.otpHash) {
            record.attemptCount += 1;
            await record.save();
            const attemptsLeft = Math.max(0, 5 - record.attemptCount);
            return (0, response_1.sendError)(res, attemptsLeft > 0
                ? `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`
                : 'Too many incorrect attempts. Please request a new code.', 400);
        }
        // OTP is valid! Mark customer as verified
        const customer = await Customer_1.Customer.findOne({ email: cleanEmail });
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer account not found', 404);
        }
        customer.isEmailVerified = true;
        customer.emailVerifiedAt = new Date();
        await customer.save();
        // Invalidate and delete verification records for this email
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        // Generate normal authenticated JWT token
        const token = generateCustomerToken(customer);
        customer.passwordHash = undefined;
        (0, response_1.sendSuccess)(res, {
            token,
            customer,
            isEmailVerified: true,
        }, 'Email verified successfully.');
    }
    catch (error) {
        next(error);
    }
});
// ============================================================
// Resend Email OTP Route
// ============================================================
async function handleResendOtp(req, res, next) {
    try {
        const { email } = req.body;
        if (!email) {
            return (0, response_1.sendError)(res, 'Email address is required', 400);
        }
        const cleanEmail = email.trim().toLowerCase();
        const customer = await Customer_1.Customer.findOne({ email: cleanEmail });
        if (!customer) {
            // Prevent email enumeration: return generic success
            return (0, response_1.sendSuccess)(res, null, 'If an account exists with this email, a verification code has been sent.');
        }
        if (customer.isEmailVerified) {
            return (0, response_1.sendError)(res, 'Email is already verified. You can sign in directly.', 400);
        }
        // Check rate limit and 60-second cooldown
        const existing = await EmailVerification_1.EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
        if (existing) {
            const now = Date.now();
            const lastSent = new Date(existing.lastSentAt).getTime();
            const diffSeconds = Math.floor((now - lastSent) / 1000);
            if (diffSeconds < 60) {
                const wait = 60 - diffSeconds;
                return (0, response_1.sendError)(res, `Please wait ${wait} second${wait === 1 ? '' : 's'} before requesting a new code.`, 429);
            }
            if (existing.resendCount >= 5) {
                return (0, response_1.sendError)(res, 'Maximum resend limit reached for this session. Please try again later.', 429);
            }
        }
        // Invalidate old OTP
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        // Generate new OTP
        const otp = (0, crypto_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await EmailVerification_1.EmailVerification.create({
            customerId: customer._id,
            email: cleanEmail,
            otpHash: (0, crypto_1.hashOtp)(otp),
            expiresAt,
            attemptCount: 0,
            lastSentAt: new Date(),
            resendCount: (existing?.resendCount || 0) + 1,
        });
        try {
            await emailService_1.emailService.sendVerificationOtp({
                email: cleanEmail,
                otp,
                customerName: customer.firstName,
                tenantId: customer.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[StorefrontAuth] Failed to resend verification OTP:', mailErr);
        }
        (0, response_1.sendSuccess)(res, {
            maskedEmail: (0, crypto_1.maskEmail)(customer.email),
        }, 'Verification code sent successfully.');
    }
    catch (error) {
        next(error);
    }
}
router.post('/resend-otp', handleResendOtp);
router.post('/send-otp', handleResendOtp);
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
// ============================================================
// Forgot Password: Send 6-Digit OTP to Registered Email
// ============================================================
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return (0, response_1.sendError)(res, 'Email address is required', 400);
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const customer = await Customer_1.Customer.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });
        if (!customer) {
            return (0, response_1.sendError)(res, 'No account found with this email address.', 404);
        }
        // Rate limit check: 60s cooldown
        const existing = await EmailVerification_1.EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
        if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < 60 * 1000) {
            const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000);
            return (0, response_1.sendError)(res, `Please wait ${waitSeconds} seconds before requesting a new code.`, 429);
        }
        // Invalidate stale records
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        const otp = (0, crypto_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await EmailVerification_1.EmailVerification.create({
            customerId: customer._id,
            email: cleanEmail,
            otpHash: (0, crypto_1.hashOtp)(otp),
            expiresAt,
            attemptCount: 0,
            lastSentAt: new Date(),
            resendCount: (existing?.resendCount || 0) + 1,
        });
        try {
            await emailService_1.emailService.sendPasswordResetOtp({
                email: cleanEmail,
                otp,
                customerName: customer.firstName,
                tenantId: customer.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[StorefrontAuth] Failed to send password reset email:', mailErr);
        }
        (0, response_1.sendSuccess)(res, {
            email: customer.email,
            maskedEmail: (0, crypto_1.maskEmail)(customer.email),
        }, 'A 6-digit verification code has been sent to your registered email.');
    }
    catch (error) {
        next(error);
    }
});
// ============================================================
// Reset Password with 6-Digit OTP
// ============================================================
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return (0, response_1.sendError)(res, 'Email, verification code, and new password are required', 400);
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanOtp = String(otp).trim();
        if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
            return (0, response_1.sendError)(res, 'Verification code must be exactly 6 digits', 400);
        }
        if (newPassword.length < 6) {
            return (0, response_1.sendError)(res, 'New password must be at least 6 characters long', 400);
        }
        const record = await EmailVerification_1.EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
        if (!record) {
            return (0, response_1.sendError)(res, 'No active verification code found for this email. Please request a new one.', 400);
        }
        if (new Date() > new Date(record.expiresAt)) {
            return (0, response_1.sendError)(res, 'Verification code has expired. Please request a new one.', 400);
        }
        if (record.attemptCount >= 5) {
            return (0, response_1.sendError)(res, 'Too many incorrect attempts. Please request a new code.', 429);
        }
        const hashedInput = (0, crypto_1.hashOtp)(cleanOtp);
        if (hashedInput !== record.otpHash) {
            record.attemptCount += 1;
            await record.save();
            const attemptsLeft = Math.max(0, 5 - record.attemptCount);
            return (0, response_1.sendError)(res, attemptsLeft > 0
                ? `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`
                : 'Too many incorrect attempts. Please request a new code.', 400);
        }
        const customer = await Customer_1.Customer.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer account not found', 404);
        }
        customer.passwordHash = newPassword;
        customer.isEmailVerified = true;
        customer.emailVerifiedAt = new Date();
        await customer.save();
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        // Send confirmation email
        try {
            await emailService_1.emailService.sendPasswordChangedNotification({
                email: cleanEmail,
                customerName: customer.firstName,
                tenantId: customer.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[StorefrontAuth] Failed to send password changed notification:', mailErr);
        }
        (0, response_1.sendSuccess)(res, null, 'Password reset successfully. You can now sign in with your new password.');
    }
    catch (error) {
        next(error);
    }
});
// ============================================================
// Send OTP to Confirm Password Change (Logged in customer)
// ============================================================
router.post('/me/send-password-otp', async (req, res, next) => {
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
        catch {
            return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
        }
        const customer = await Customer_1.Customer.findById(decoded.sub);
        if (!customer) {
            return (0, response_1.sendError)(res, 'Customer not found', 404);
        }
        const cleanEmail = customer.email;
        const existing = await EmailVerification_1.EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
        if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < 60 * 1000) {
            const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000);
            return (0, response_1.sendError)(res, `Please wait ${waitSeconds} seconds before requesting another code.`, 429);
        }
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        const otp = (0, crypto_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await EmailVerification_1.EmailVerification.create({
            customerId: customer._id,
            email: cleanEmail,
            otpHash: (0, crypto_1.hashOtp)(otp),
            expiresAt,
            attemptCount: 0,
            lastSentAt: new Date(),
            resendCount: (existing?.resendCount || 0) + 1,
        });
        try {
            await emailService_1.emailService.sendPasswordChangeOtp({
                email: cleanEmail,
                otp,
                customerName: customer.firstName,
                tenantId: customer.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[StorefrontAuth] Failed to send password change OTP:', mailErr);
        }
        (0, response_1.sendSuccess)(res, { maskedEmail: (0, crypto_1.maskEmail)(cleanEmail) }, 'Verification code sent to your registered email.');
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
        const { currentPassword, newPassword, otp } = req.body;
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
        // Verify OTP
        if (!otp) {
            return (0, response_1.sendError)(res, 'Verification code is required. Please click Send Code to receive a code on your registered email.', 400);
        }
        const cleanOtp = String(otp).trim();
        const record = await EmailVerification_1.EmailVerification.findOne({ email: customer.email }).sort({ createdAt: -1 });
        if (!record) {
            return (0, response_1.sendError)(res, 'No active verification code found. Please click Send Code first.', 400);
        }
        if (new Date() > new Date(record.expiresAt)) {
            return (0, response_1.sendError)(res, 'Verification code has expired. Please request a new one.', 400);
        }
        if (record.attemptCount >= 5) {
            return (0, response_1.sendError)(res, 'Too many incorrect attempts. Please request a new code.', 429);
        }
        if ((0, crypto_1.hashOtp)(cleanOtp) !== record.otpHash) {
            record.attemptCount += 1;
            await record.save();
            return (0, response_1.sendError)(res, 'Invalid verification code. Please check your email and try again.', 400);
        }
        await EmailVerification_1.EmailVerification.deleteMany({ email: customer.email });
        // Assign new password, pre-save hook will hash it
        customer.passwordHash = newPassword;
        await customer.save();
        // Send confirmation email
        try {
            await emailService_1.emailService.sendPasswordChangedNotification({
                email: customer.email,
                customerName: customer.firstName,
                tenantId: customer.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[StorefrontAuth] Failed to send password changed notification:', mailErr);
        }
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
        if (order.fulfillmentStatus !== 'fulfilled') {
            return (0, response_1.sendError)(res, 'Returns and complaints can only be filed once the product has been delivered and received.', 400);
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