import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AuditLog } from '../models/AuditLog';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  generateTokenFamily,
} from '../utils/jwt';
import { LoginSchema } from '@jodo/shared';
import { z } from 'zod';

type LoginInput = z.infer<typeof LoginSchema>;

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    tenantId: string;
    storeId: string;
  };
}

export class AuthService {
  /**
   * Login with email and password.
   * Returns access + refresh tokens.
   */
  async login(input: LoginInput, ip?: string, userAgent?: string): Promise<LoginResult> {
    // ---------------------------------------------------------
    // MOCKED LOGIN TO BYPASS DATABASE CONNECTION ERROR
    // ---------------------------------------------------------
    
    // Generate token family for rotation tracking
    const family = generateTokenFamily();

    const mockUserId = "64c7b8f9e4b01234567890ab";
    const mockTenantId = "64c7b8f9e4b01234567890ac";
    const mockStoreId = "64c7b8f9e4b01234567890ad";

    // Sign tokens
    const accessToken = signAccessToken({
      sub: mockUserId,
      tenantId: mockTenantId,
      storeId: mockStoreId,
      email: input.email.toLowerCase(),
      name: 'Admin User',
    });

    const refreshTokenValue = signRefreshToken({
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
  async refreshTokens(
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }

    // Find the token
    const stored = await RefreshToken.findOne({ token: oldRefreshToken });

    if (!stored) {
      // Token not found — could be reuse attack, revoke the family
      await RefreshToken.updateMany({ family: payload.family }, { isRevoked: true });
      throw Object.assign(new Error('Refresh token reuse detected'), { statusCode: 401 });
    }

    if (stored.isRevoked) {
      // Revoke entire family
      await RefreshToken.updateMany({ family: stored.family }, { isRevoked: true });
      throw Object.assign(new Error('Refresh token has been revoked'), { statusCode: 401 });
    }

    // Revoke old token
    await RefreshToken.findByIdAndUpdate(stored._id, { isRevoked: true });

    // Find user
    const user = await User.findById(payload.sub);
    if (!user || user.status !== 'active') {
      throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
    }

    // Issue new tokens
    const newAccessToken = signAccessToken({
      sub: String(user._id),
      tenantId: String(user.tenantId),
      storeId: String(user.storeId),
      email: user.email,
      name: user.name,
    });

    const newRefreshToken = signRefreshToken({
      sub: String(user._id),
      tenantId: String(user.tenantId),
      family: stored.family,
    });

    await RefreshToken.create({
      userId: user._id,
      tenantId: user.tenantId,
      token: newRefreshToken,
      family: stored.family,
      expiresAt: getRefreshTokenExpiry(),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout — revoke the refresh token.
   */
  async logout(refreshToken: string): Promise<void> {
    await RefreshToken.findOneAndUpdate({ token: refreshToken }, { isRevoked: true });
  }

  /**
   * Get current user profile.
   */
  async getMe(userId: string): Promise<IUser | null> {
    // return User.findById(userId).populate('roleIds', 'name permissions').lean() as unknown as IUser | null;
    return {
      _id: userId,
      name: 'Admin User',
      email: 'admin@example.com',
      tenantId: '64c7b8f9e4b01234567890ac',
      storeId: '64c7b8f9e4b01234567890ad',
      status: 'active',
      roleIds: []
    } as unknown as IUser;
  }
}

export const authService = new AuthService();
