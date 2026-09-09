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
    memberId?: string;
    roles?: string[];
    avatarUrl?: string;
    tenantId: string;
    storeId: string;
  };
}

export class AuthService {
  /**
   * Login with email and password.
   */
  async login(input: LoginInput, ip?: string, userAgent?: string): Promise<LoginResult> {
    let user;
    if (input.email.includes('@')) {
      user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash').populate('roleIds', 'name');
    } else {
      user = await User.findOne({ memberId: input.email.toUpperCase() }).select('+passwordHash').populate('roleIds', 'name');
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
    const family = generateTokenFamily();

    // Sign tokens
    const accessToken = signAccessToken({
      sub: String(user._id),
      tenantId: String(user.tenantId),
      storeId: String(user.storeId),
      email: user.email || user.memberId || '',
      name: user.name,
    });

    const refreshTokenValue = signRefreshToken({
      sub: String(user._id),
      tenantId: String(user.tenantId),
      family,
    });

    await RefreshToken.create({
      userId: user._id,
      tenantId: user.tenantId,
      token: refreshTokenValue,
      family,
      expiresAt: getRefreshTokenExpiry(),
      ip,
      userAgent,
    });

    // Log login activity
    await AuditLog.create({
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
        roles: (user.roleIds as any[]).map(r => r.name),
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
      email: user.email || '',
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
    return User.findById(userId).populate('roleIds', 'name permissions').lean() as unknown as IUser | null;
  }
}

export const authService = new AuthService();
