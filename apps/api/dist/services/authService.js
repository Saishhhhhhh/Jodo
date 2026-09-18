"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const AuditLog_1 = require("../models/AuditLog");
const jwt_1 = require("../utils/jwt");
class AuthService {
    /**
     * Login with email and password.
     * Returns access + refresh tokens.
     */
    async login(input, ip, userAgent) {
        // Find user with passwordHash selected (it's excluded by default)
        const user = await User_1.User.findOne({ email: input.email.toLowerCase(), status: 'active' })
            .select('+passwordHash')
            .lean();
        if (!user) {
            throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
        }
        // Verify password
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const isValid = await (bcrypt.default || bcrypt).compare(input.password, user.passwordHash);
        if (!isValid) {
            throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
        }
        // Generate token family for rotation tracking
        const family = (0, jwt_1.generateTokenFamily)();
        // Sign tokens
        const accessToken = (0, jwt_1.signAccessToken)({
            sub: String(user._id),
            tenantId: String(user.tenantId),
            storeId: String(user.storeId),
            email: user.email,
            name: user.name,
        });
        const refreshTokenValue = (0, jwt_1.signRefreshToken)({
            sub: String(user._id),
            tenantId: String(user.tenantId),
            family,
        });
        // Persist refresh token
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            tenantId: user.tenantId,
            token: refreshTokenValue,
            family,
            expiresAt: (0, jwt_1.getRefreshTokenExpiry)(),
        });
        // Update last login
        await User_1.User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
        // Audit log
        await AuditLog_1.AuditLog.create({
            tenantId: user.tenantId,
            storeId: user.storeId,
            actorUserId: user._id,
            actorType: 'user',
            action: 'auth.login',
            resourceType: 'User',
            resourceId: String(user._id),
            ip,
            userAgent,
        });
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
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
            email: user.email,
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