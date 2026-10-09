"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const shared_1 = require("@jodo/shared");
const response_1 = require("../utils/response");
const EmailVerification_1 = require("../models/EmailVerification");
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
const crypto_1 = require("../utils/crypto");
const router = (0, express_1.Router)();
/**
 * POST /api/admin/auth/login
 * Authenticate staff user and return tokens
 */
router.post('/login', (0, validate_1.validate)(shared_1.LoginSchema), async (req, res) => {
    try {
        const ip = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const result = await authService_1.authService.login(req.body, ip, userAgent);
        (0, response_1.sendSuccess)(res, result, 'Login successful');
    }
    catch (err) {
        const error = err;
        (0, response_1.sendError)(res, error.message || 'Login failed', error.statusCode || 400);
    }
});
/**
 * POST /api/admin/auth/refresh
 * Rotate refresh token and issue new access token
 */
router.post('/refresh', (0, validate_1.validate)(shared_1.RefreshTokenSchema), async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService_1.authService.refreshTokens(refreshToken);
        (0, response_1.sendSuccess)(res, result, 'Token refreshed');
    }
    catch (err) {
        const error = err;
        (0, response_1.sendUnauthorized)(res, error.message || 'Token refresh failed');
    }
});
/**
 * POST /api/admin/auth/logout
 * Revoke refresh token
 */
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await authService_1.authService.logout(refreshToken);
        }
        (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
    }
    catch {
        (0, response_1.sendSuccess)(res, null, 'Logged out');
    }
});
/**
 * GET /api/admin/auth/me
 * Get current authenticated user
 */
router.get('/me', auth_1.requireAuth, async (req, res) => {
    try {
        const user = await authService_1.authService.getMe(req.auth.sub);
        if (!user) {
            (0, response_1.sendUnauthorized)(res, 'User not found');
            return;
        }
        (0, response_1.sendSuccess)(res, user);
    }
    catch {
        (0, response_1.sendError)(res, 'Failed to fetch user');
    }
});
/**
 * POST /api/admin/auth/send-change-password-otp
 * Send 6-digit OTP to user's registered email before changing password
 */
router.post('/send-change-password-otp', auth_1.requireAuth, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.auth.sub);
        if (!user || !user.email) {
            return (0, response_1.sendError)(res, 'User email not found', 404);
        }
        const cleanEmail = user.email.toLowerCase();
        const existing = await EmailVerification_1.EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
        if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < 60 * 1000) {
            const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000);
            return (0, response_1.sendError)(res, `Please wait ${waitSeconds} seconds before requesting another code.`, 429);
        }
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        const otp = (0, crypto_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await EmailVerification_1.EmailVerification.create({
            userId: user._id,
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
                customerName: user.name,
                tenantId: user.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[AdminAuth] Failed to send password change OTP:', mailErr);
        }
        (0, response_1.sendSuccess)(res, { maskedEmail: (0, crypto_1.maskEmail)(cleanEmail) }, 'Verification code sent to your registered email.');
    }
    catch (error) {
        (0, response_1.sendError)(res, 'Failed to dispatch verification code', 500);
    }
});
/**
 * PUT /api/admin/auth/change-password
 * Change current authenticated user's password with optional OTP verification
 */
router.put('/change-password', auth_1.requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword, otp } = req.body;
        if (!currentPassword || !newPassword) {
            return (0, response_1.sendError)(res, 'Current and new password are required', 400);
        }
        const user = await User_1.User.findById(req.auth.sub).select('+passwordHash');
        if (!user) {
            return (0, response_1.sendError)(res, 'User not found', 404);
        }
        // Verify OTP if user has email
        if (user.email) {
            if (!otp) {
                return (0, response_1.sendError)(res, 'Verification code is required. Please click Send Code to receive an OTP on your registered email.', 400);
            }
            const cleanOtp = String(otp).trim();
            const record = await EmailVerification_1.EmailVerification.findOne({ email: user.email.toLowerCase() }).sort({ createdAt: -1 });
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
            await EmailVerification_1.EmailVerification.deleteMany({ email: user.email.toLowerCase() });
        }
        await authService_1.authService.changePassword(req.auth.sub, currentPassword, newPassword);
        // Send confirmation email if user has email
        if (user.email) {
            try {
                await emailService_1.emailService.sendPasswordChangedNotification({
                    email: user.email,
                    customerName: user.name,
                    tenantId: user.tenantId,
                });
            }
            catch (mailErr) {
                console.error('[AdminAuth] Failed to send confirmation email:', mailErr);
            }
        }
        (0, response_1.sendSuccess)(res, null, 'Password changed successfully');
    }
    catch (err) {
        const error = err;
        (0, response_1.sendError)(res, error.message || 'Failed to change password', error.statusCode || 400);
    }
});
/**
 * POST /api/admin/auth/forgot-password
 * Request password reset OTP for staff/admin email
 */
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return (0, response_1.sendError)(res, 'Email address is required', 400);
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const user = await User_1.User.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        });
        if (!user) {
            return (0, response_1.sendError)(res, 'No administrator account found with this email.', 404);
        }
        const existing = await EmailVerification_1.EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
        if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < 60 * 1000) {
            const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000);
            return (0, response_1.sendError)(res, `Please wait ${waitSeconds} seconds before requesting a new code.`, 429);
        }
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        const otp = (0, crypto_1.generateOtp)();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await EmailVerification_1.EmailVerification.create({
            userId: user._id,
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
                customerName: user.name,
                tenantId: user.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[AdminAuth] Failed to send password reset email:', mailErr);
        }
        (0, response_1.sendSuccess)(res, { maskedEmail: (0, crypto_1.maskEmail)(cleanEmail) }, 'Verification code sent to your registered email.');
    }
    catch {
        (0, response_1.sendError)(res, 'Failed to process request', 500);
    }
});
/**
 * POST /api/admin/auth/reset-password
 * Reset password using 6-digit OTP
 */
router.post('/reset-password', async (req, res) => {
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
            return (0, response_1.sendError)(res, 'No active verification code found for this email.', 400);
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
            return (0, response_1.sendError)(res, 'Invalid verification code. Please try again.', 400);
        }
        const user = await User_1.User.findOne({ email: cleanEmail });
        if (!user) {
            return (0, response_1.sendError)(res, 'User not found', 404);
        }
        user.passwordHash = newPassword;
        await user.save();
        await EmailVerification_1.EmailVerification.deleteMany({ email: cleanEmail });
        try {
            await emailService_1.emailService.sendPasswordChangedNotification({
                email: cleanEmail,
                customerName: user.name,
                tenantId: user.tenantId,
            });
        }
        catch (mailErr) {
            console.error('[AdminAuth] Failed to send password changed notification:', mailErr);
        }
        (0, response_1.sendSuccess)(res, null, 'Password reset successfully. You can now log in.');
    }
    catch {
        (0, response_1.sendError)(res, 'Failed to reset password', 500);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map