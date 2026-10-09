import { Router, Request, Response } from 'express';
import { authService } from '../services/authService';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { LoginSchema, RefreshTokenSchema } from '@jodo/shared';
import { sendSuccess, sendError, sendUnauthorized } from '../utils/response';
import { EmailVerification } from '../models/EmailVerification';
import { User } from '../models/User';
import { emailService } from '../services/emailService';
import { generateOtp, hashOtp, maskEmail } from '../utils/crypto';

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
 * POST /api/admin/auth/send-change-password-otp
 * Send 6-digit OTP to user's registered email before changing password
 */
router.post('/send-change-password-otp', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.auth!.sub);
    if (!user || !user.email) {
      return sendError(res, 'User email not found', 404);
    }

    const cleanEmail = user.email.toLowerCase();
    const existing = await EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
    if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000);
      return sendError(res, `Please wait ${waitSeconds} seconds before requesting another code.`, 429);
    }

    await EmailVerification.deleteMany({ email: cleanEmail });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailVerification.create({
      userId: user._id,
      email: cleanEmail,
      otpHash: hashOtp(otp),
      expiresAt,
      attemptCount: 0,
      lastSentAt: new Date(),
      resendCount: (existing?.resendCount || 0) + 1,
    });

    try {
      await emailService.sendPasswordChangeOtp({
        email: cleanEmail,
        otp,
        customerName: user.name,
        tenantId: user.tenantId,
      });
    } catch (mailErr) {
      console.error('[AdminAuth] Failed to send password change OTP:', mailErr);
    }

    sendSuccess(
      res,
      { maskedEmail: maskEmail(cleanEmail) },
      'Verification code sent to your registered email.'
    );
  } catch (error) {
    sendError(res, 'Failed to dispatch verification code', 500);
  }
});

/**
 * PUT /api/admin/auth/change-password
 * Change current authenticated user's password with optional OTP verification
 */
router.put('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, otp } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required', 400);
    }

    const user = await User.findById(req.auth!.sub).select('+passwordHash');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify OTP if user has email
    if (user.email) {
      if (!otp) {
        return sendError(res, 'Verification code is required. Please click Send Code to receive an OTP on your registered email.', 400);
      }
      const cleanOtp = String(otp).trim();
      const record = await EmailVerification.findOne({ email: user.email.toLowerCase() }).sort({ createdAt: -1 });
      if (!record) {
        return sendError(res, 'No active verification code found. Please click Send Code first.', 400);
      }
      if (new Date() > new Date(record.expiresAt)) {
        return sendError(res, 'Verification code has expired. Please request a new one.', 400);
      }
      if (record.attemptCount >= 5) {
        return sendError(res, 'Too many incorrect attempts. Please request a new code.', 429);
      }
      if (hashOtp(cleanOtp) !== record.otpHash) {
        record.attemptCount += 1;
        await record.save();
        return sendError(res, 'Invalid verification code. Please check your email and try again.', 400);
      }
      await EmailVerification.deleteMany({ email: user.email.toLowerCase() });
    }

    await authService.changePassword(req.auth!.sub, currentPassword, newPassword);

    // Send confirmation email if user has email
    if (user.email) {
      try {
        await emailService.sendPasswordChangedNotification({
          email: user.email,
          customerName: user.name,
          tenantId: user.tenantId,
        });
      } catch (mailErr) {
        console.error('[AdminAuth] Failed to send confirmation email:', mailErr);
      }
    }

    sendSuccess(res, null, 'Password changed successfully');
  } catch (err: unknown) {
    const error = err as { message?: string; statusCode?: number };
    sendError(res, error.message || 'Failed to change password', error.statusCode || 400);
  }
});

/**
 * POST /api/admin/auth/forgot-password
 * Request password reset OTP for staff/admin email
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Email address is required', 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });

    if (!user) {
      return sendError(res, 'No administrator account found with this email.', 404);
    }

    const existing = await EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
    if (existing && Date.now() - new Date(existing.lastSentAt).getTime() < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (Date.now() - new Date(existing.lastSentAt).getTime())) / 1000);
      return sendError(res, `Please wait ${waitSeconds} seconds before requesting a new code.`, 429);
    }

    await EmailVerification.deleteMany({ email: cleanEmail });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailVerification.create({
      userId: user._id,
      email: cleanEmail,
      otpHash: hashOtp(otp),
      expiresAt,
      attemptCount: 0,
      lastSentAt: new Date(),
      resendCount: (existing?.resendCount || 0) + 1,
    });

    try {
      await emailService.sendPasswordResetOtp({
        email: cleanEmail,
        otp,
        customerName: user.name,
        tenantId: user.tenantId,
      });
    } catch (mailErr) {
      console.error('[AdminAuth] Failed to send password reset email:', mailErr);
    }

    sendSuccess(
      res,
      { maskedEmail: maskEmail(cleanEmail) },
      'Verification code sent to your registered email.'
    );
  } catch {
    sendError(res, 'Failed to process request', 500);
  }
});

/**
 * POST /api/admin/auth/reset-password
 * Reset password using 6-digit OTP
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return sendError(res, 'Email, verification code, and new password are required', 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return sendError(res, 'Verification code must be exactly 6 digits', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters long', 400);
    }

    const record = await EmailVerification.findOne({ email: cleanEmail }).sort({ createdAt: -1 });
    if (!record) {
      return sendError(res, 'No active verification code found for this email.', 400);
    }

    if (new Date() > new Date(record.expiresAt)) {
      return sendError(res, 'Verification code has expired. Please request a new one.', 400);
    }

    if (record.attemptCount >= 5) {
      return sendError(res, 'Too many incorrect attempts. Please request a new code.', 429);
    }

    const hashedInput = hashOtp(cleanOtp);
    if (hashedInput !== record.otpHash) {
      record.attemptCount += 1;
      await record.save();
      return sendError(res, 'Invalid verification code. Please try again.', 400);
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.passwordHash = newPassword;
    await user.save();

    await EmailVerification.deleteMany({ email: cleanEmail });

    try {
      await emailService.sendPasswordChangedNotification({
        email: cleanEmail,
        customerName: user.name,
        tenantId: user.tenantId,
      });
    } catch (mailErr) {
      console.error('[AdminAuth] Failed to send password changed notification:', mailErr);
    }

    sendSuccess(res, null, 'Password reset successfully. You can now log in.');
  } catch {
    sendError(res, 'Failed to reset password', 500);
  }
});

export default router;
