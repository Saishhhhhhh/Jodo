"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const shared_1 = require("@jodo/shared");
const response_1 = require("../utils/response");
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
exports.default = router;
//# sourceMappingURL=auth.js.map