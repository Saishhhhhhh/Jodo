import { IUser } from '../models/User';
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
export declare class AuthService {
    /**
     * Login with email and password.
     * Returns access + refresh tokens.
     */
    login(input: LoginInput, ip?: string, userAgent?: string): Promise<LoginResult>;
    /**
     * Rotate refresh token.
     * Implements refresh token reuse detection — revokes entire family on reuse.
     */
    refreshTokens(oldRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Logout — revoke the refresh token.
     */
    logout(refreshToken: string): Promise<void>;
    /**
     * Get current user profile.
     */
    getMe(userId: string): Promise<IUser | null>;
}
export declare const authService: AuthService;
export {};
