"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const AuditLog_1 = require("../models/AuditLog");
const jwt_1 = require("../utils/jwt");
class AuthService {
    /**
     * Login with email and password.
     */
    async login(input, ip, userAgent) {
        let user;
        if (input.email.includes('@')) {
            user = await User_1.User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash').populate('roleIds', 'name');
        }
        else {
            user = await User_1.User.findOne({ memberId: input.email.toUpperCase() }).select('+passwordHash').populate('roleIds', 'name');
        }
        if (!user) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }
        if (user.status !== 'active') {
            throw Object.assign(new Error('Account is inactive'), { statusCode: 401 });
        }
        const isValid = await user.comparePassword(input.password);
        if (!isValid) {
            throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
        }
        // Generate token family for rotation tracking
        const family = (0, jwt_1.generateTokenFamily)();
        // Sign tokens
        const accessToken = (0, jwt_1.signAccessToken)({
            sub: String(user._id),
            tenantId: String(user.tenantId),
            storeId: String(user.storeId),
            email: user.email || user.memberId || '',
            name: user.name,
        });
        const refreshTokenValue = (0, jwt_1.signRefreshToken)({
            sub: String(user._id),
            tenantId: String(user.tenantId),
            family,
        });
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            tenantId: user.tenantId,
            token: refreshTokenValue,
            family,
            expiresAt: (0, jwt_1.getRefreshTokenExpiry)(),
            ip,
            userAgent,
        });
        // Log login activity
        await AuditLog_1.AuditLog.create({
            tenantId: user.tenantId,
            storeId: user.storeId,
            actorUserId: user._id,
            actorType: 'user',
            action: 'LOGIN_SUCCESS',
            resourceType: 'Auth',
            ip,
            userAgent,
        });
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email || user.memberId || '',
                memberId: user.memberId,
                roles: user.roleIds.map(r => r.name),
                avatarUrl: user.avatarUrl,
                tenantId: String(user.tenantId),
                storeId: String(user.storeId),
            },
        };
    }
    /**
     * Rotate refresh token.
     * Implements refresh token reuse detection — revokes entire family on reuse.
     */
    async refreshTokens(oldRefreshToken) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(oldRefreshToken);
        }
        catch {
            throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
        }
        // Find the token
        const stored = await RefreshToken_1.RefreshToken.findOne({ token: oldRefreshToken });
        if (!stored) {
            // Token not found — could be reuse attack, revoke the family
            await RefreshToken_1.RefreshToken.updateMany({ family: payload.family }, { isRevoked: true });
            throw Object.assign(new Error('Refresh token reuse detected'), { statusCode: 401 });
        }
        if (stored.isRevoked) {
            // Revoke entire family
            await RefreshToken_1.RefreshToken.updateMany({ family: stored.family }, { isRevoked: true });
            throw Object.assign(new Error('Refresh token has been revoked'), { statusCode: 401 });
        }
        // Revoke old token
        await RefreshToken_1.RefreshToken.findByIdAndUpdate(stored._id, { isRevoked: true });
        // Find user
        const user = await User_1.User.findById(payload.sub);
        if (!user || user.status !== 'active') {
            throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
        }
        // Issue new tokens
        const newAccessToken = (0, jwt_1.signAccessToken)({
            sub: String(user._id),
            tenantId: String(user.tenantId),
            storeId: String(user.storeId),
            email: user.email || '',
            name: user.name,
        });
        const newRefreshToken = (0, jwt_1.signRefreshToken)({
            sub: String(user._id),
            tenantId: String(user.tenantId),
            family: stored.family,
        });
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            tenantId: user.tenantId,
            token: newRefreshToken,
            family: stored.family,
            expiresAt: (0, jwt_1.getRefreshTokenExpiry)(),
        });
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
    /**
     * Logout — revoke the refresh token.
     */
    async logout(refreshToken) {
        await RefreshToken_1.RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
    }
    /**
     * Get current user profile.
     */
    async getMe(userId) {
        return User_1.User.findById(userId).populate('roleIds', 'name permissions').lean();
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map