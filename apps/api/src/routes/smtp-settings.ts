import { Router, Request, Response } from 'express';
import { requireAuth, requireTenant } from '../middleware/auth';
import { Store } from '../models/Store';
import { sendSuccess, sendError } from '../utils/response';
import { encrypt, decrypt } from '../utils/crypto';
import { emailService, SmtpConfig } from '../services/emailService';
import mongoose from 'mongoose';

const router = Router();

router.use(requireAuth, requireTenant);

/**
 * Helper to strip sensitive password from response
 */
function toSafeSmtpResponse(smtpSettings: any) {
  if (!smtpSettings) {
    return {
      provider: 'custom',
      host: '',
      port: 587,
      username: '',
      encryption: 'STARTTLS',
      fromEmail: '',
      fromName: 'Jodo',
      isConfigured: false,
      smtpPasswordConfigured: false,
    };
  }

  const hasPassword = Boolean(smtpSettings.encryptedPassword || smtpSettings.password);

  return {
    provider: smtpSettings.provider || 'custom',
    host: smtpSettings.host || '',
    port: Number(smtpSettings.port) || 587,
    username: smtpSettings.username || '',
    encryption: smtpSettings.encryption || 'STARTTLS',
    fromEmail: smtpSettings.fromEmail || '',
    fromName: smtpSettings.fromName || 'Jodo',
    isConfigured: Boolean(smtpSettings.host && hasPassword),
    smtpPasswordConfigured: hasPassword,
    updatedAt: smtpSettings.updatedAt,
  };
}

/**
 * GET /api/admin/settings/smtp
 * Retrieve active SMTP configuration (safe, password omitted).
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const store = await Store.findOne({ tenantId });

    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    const smtpSettings = (store.settings as any)?.smtp;
    sendSuccess(res, toSafeSmtpResponse(smtpSettings), 'SMTP configuration retrieved');
  } catch (error: any) {
    console.error('Error fetching SMTP settings:', error);
    sendError(res, 'Failed to fetch SMTP settings', 500);
  }
});

/**
 * PUT /api/admin/settings/smtp
 * Save or update SMTP configuration. Sensitive password is encrypted.
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const {
      provider,
      host,
      port,
      username,
      password,
      encryption,
      fromEmail,
      fromName,
    } = req.body;

    if (!host) {
      return sendError(res, 'SMTP host is required', 400);
    }

    if (!port || isNaN(Number(port))) {
      return sendError(res, 'Valid SMTP port is required (e.g. 587 or 465)', 400);
    }

    const store = await Store.findOne({ tenantId });
    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    const existingSmtp = ((store.settings as any)?.smtp || {}) as any;

    let encryptedPassword = existingSmtp.encryptedPassword;
    if (password && typeof password === 'string' && password.trim().length > 0) {
      encryptedPassword = encrypt(password.trim());
    }

    const updatedSmtp = {
      provider: provider || existingSmtp.provider || 'custom',
      host: host.trim(),
      port: Number(port),
      username: (username || '').trim(),
      encryptedPassword,
      encryption: encryption || (Number(port) === 465 ? 'TLS' : 'STARTTLS'),
      fromEmail: (fromEmail || store.settings?.email || 'noreply@jodoshop.com').trim(),
      fromName: (fromName || store.name || 'Jodo').trim(),
      isConfigured: Boolean(host && encryptedPassword),
      updatedAt: new Date(),
    };

    store.settings = {
      ...(store.settings as Record<string, unknown>),
      smtp: updatedSmtp,
    };
    store.markModified('settings');
    await store.save();

    sendSuccess(
      res,
      toSafeSmtpResponse(updatedSmtp),
      'SMTP settings saved successfully'
    );
  } catch (error: any) {
    console.error('Error updating SMTP settings:', error);
    sendError(res, 'Failed to update SMTP settings', 500);
  }
});

/**
 * POST /api/admin/settings/smtp/test
 * Test SMTP connection handshake (transporter.verify).
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const { host, port, username, password, encryption, fromEmail, fromName, provider } = req.body;

    let testConfig: SmtpConfig | null = null;

    // If request contains credentials in body, test those directly
    if (host && port) {
      const store = await Store.findOne({ tenantId });
      const existingSmtp = (store?.settings as any)?.smtp;

      let effectivePassword = password;
      if (!effectivePassword && existingSmtp?.encryptedPassword) {
        effectivePassword = decrypt(existingSmtp.encryptedPassword);
      }

      testConfig = {
        provider: provider || 'custom',
        host: host.trim(),
        port: Number(port),
        username: (username || '').trim(),
        password: effectivePassword || '',
        encryption: encryption || (Number(port) === 465 ? 'TLS' : 'STARTTLS'),
        fromEmail: (fromEmail || 'noreply@jodoshop.com').trim(),
        fromName: (fromName || 'Jodo').trim(),
      };
    }

    const result = await emailService.verifySmtpConnection(testConfig, tenantId);

    if (result.success) {
      sendSuccess(res, { verified: true }, result.message);
    } else {
      sendError(res, result.message, 400);
    }
  } catch (error: any) {
    console.error('SMTP test connection error:', error);
    sendError(res, error.message || 'SMTP connection verification failed', 500);
  }
});

/**
 * POST /api/admin/settings/smtp/send-test
 * Dispatch a real test email to verify end-to-end delivery.
 */
router.post('/send-test', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    const { toEmail } = req.body;

    if (!toEmail || !toEmail.includes('@')) {
      return sendError(res, 'Please provide a valid recipient email address', 400);
    }

    const result = await emailService.sendTestEmail({
      to: toEmail.trim(),
      tenantId,
    });

    if (result.success) {
      sendSuccess(res, { delivered: true }, result.message);
    } else {
      sendError(res, result.message, 400);
    }
  } catch (error: any) {
    console.error('SMTP send test email error:', error);
    sendError(res, error.message || 'Failed to dispatch test email', 500);
  }
});

export default router;
