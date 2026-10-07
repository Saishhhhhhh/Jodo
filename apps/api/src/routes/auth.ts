import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { LoginSchema, RefreshTokenSchema } from '@jodo/shared';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';

const router = Router();

/**
 * POST /api/admin/auth/login
 * Authenticate staff user and return tokens
 */
router.post('/login', validate(LoginSchema), async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const result = await authService.login(req.body, ip, userAgent);
    sendSuccess(res, result, 'Login successful');
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number };
    sendError(res, error.message || 'Login failed', error.statusCode || 400);
  }
});

/**
 * POST /api/admin/auth/refresh
 * Rotate refresh token and issue new access token
 */
router.post('/refresh', validate(RefreshTokenSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    sendSuccess(res, result, 'Token refreshed');
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number };
    sendUnauthorized(res, error.message || 'Token refresh failed');
  }
});

/**
 * POST /api/admin/auth/logout
 * Revoke refresh token
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    sendSuccess(res, null, 'Logged out successfully');
  } catch {
    sendSuccess(res, null, 'Logged out');
  }
});

/**
 * GET /api/admin/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await authService.getMe(req.auth!.sub);
    if (!user) {
      sendUnauthorized(res, 'User not found');
      return;
    }
    sendSuccess(res, user);
  } catch {
    sendError(res, 'Failed to fetch user');
  }
});

/**
 * PUT /api/admin/auth/change-password
 * Change current authenticated user's password
 */
router.put('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required', 400);
    }
    await authService.changePassword(req.auth!.sub, currentPassword, newPassword);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number };
    sendError(res, error.message || 'Failed to change password', error.statusCode || 400);
  }
});

export default router;
