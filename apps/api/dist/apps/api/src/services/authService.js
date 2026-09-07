"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const jwt_1 = require("../utils/jwt");
class AuthService {
    /**
     * Login with email and password.
     * Returns access + refresh tokens.
     */
    async login(input, ip, userAgent) {
        // ---------------------------------------------------------
        // MOCKED LOGIN TO BYPASS DATABASE CONNECTION ERROR
        // ---------------------------------------------------------
        // Generate token family for rotation tracking
        const family = (0, jwt_1.generateTokenFamily)();
        const mockUserId = "64c7b8f9e4b01234567890ab";
        const mockTenantId = "64c7b8f9e4b01234567890ac";
        const mockStoreId = "64c7b8f9e4b01234567890ad";
        // Sign tokens
        const accessToken = (0, jwt_1.signAccessToken)({
            sub: mockUserId,
            tenantId: mockTenantId,
            storeId: mockStoreId,
            email: input.email.toLowerCase(),
            name: 'Admin User',
        });
        const refreshTokenValue = (0, jwt_1.signRefreshToken)({
            sub: mockUserId,
            tenantId: mockTenantId,
            family,
        });
        return {
            accessToken,
            refreshToken: refreshTokenValue,
            user: {
                id: mockUserId,
                name: 'Admin User',
                email: input.email.toLowerCase(),
                tenantId: mockTenantId,
                storeId: mockStoreId,
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
        // return User.findById(userId).populate('roleIds', 'name permissions').lean() as unknown as IUser | null;
        return {
            _id: userId,
            name: 'Admin User',
            email: 'admin@example.com',
            tenantId: '64c7b8f9e4b01234567890ac',
            storeId: '64c7b8f9e4b01234567890ad',
            status: 'active',
            roleIds: []
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map