"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Store_1 = require("../models/Store");
const response_1 = require("../utils/response");
const crypto_1 = require("../utils/crypto");
const emailService_1 = require("../services/emailService");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth, auth_1.requireTenant);
/**
 * Helper to strip sensitive password from response
 */
function toSafeSmtpResponse(smtpSettings) {
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
router.get('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const store = await Store_1.Store.findOne({ tenantId });
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not found', 404);
        }
        const smtpSettings = store.settings?.smtp;
        (0, response_1.sendSuccess)(res, toSafeSmtpResponse(smtpSettings), 'SMTP configuration retrieved');
    }
    catch (error) {
        console.error('Error fetching SMTP settings:', error);
        (0, response_1.sendError)(res, 'Failed to fetch SMTP settings', 500);
    }
});
/**
 * PUT /api/admin/settings/smtp
 * Save or update SMTP configuration. Sensitive password is encrypted.
 */
router.put('/', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const { provider, host, port, username, password, encryption, fromEmail, fromName, } = req.body;
        if (!host) {
            return (0, response_1.sendError)(res, 'SMTP host is required', 400);
        }
        if (!port || isNaN(Number(port))) {
            return (0, response_1.sendError)(res, 'Valid SMTP port is required (e.g. 587 or 465)', 400);
        }
        const store = await Store_1.Store.findOne({ tenantId });
        if (!store) {
            return (0, response_1.sendError)(res, 'Store not found', 404);
        }
        const existingSmtp = (store.settings?.smtp || {});
        let encryptedPassword = existingSmtp.encryptedPassword;
        if (password && typeof password === 'string' && password.trim().length > 0) {
            encryptedPassword = (0, crypto_1.encrypt)(password.trim());
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
            ...store.settings,
            smtp: updatedSmtp,
        };
        store.markModified('settings');
        await store.save();
        (0, response_1.sendSuccess)(res, toSafeSmtpResponse(updatedSmtp), 'SMTP settings saved successfully');
    }
    catch (error) {
        console.error('Error updating SMTP settings:', error);
        (0, response_1.sendError)(res, 'Failed to update SMTP settings', 500);
    }
});
/**
 * POST /api/admin/settings/smtp/test
 * Test SMTP connection handshake (transporter.verify).
 */
router.post('/test', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const { host, port, username, password, encryption, fromEmail, fromName, provider } = req.body;
        let testConfig = null;
        // If request contains credentials in body, test those directly
        if (host && port) {
            const store = await Store_1.Store.findOne({ tenantId });
            const existingSmtp = store?.settings?.smtp;
            let effectivePassword = password;
            if (!effectivePassword && existingSmtp?.encryptedPassword) {
                effectivePassword = (0, crypto_1.decrypt)(existingSmtp.encryptedPassword);
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
        const result = await emailService_1.emailService.verifySmtpConnection(testConfig, tenantId);
        if (result.success) {
            (0, response_1.sendSuccess)(res, { verified: true }, result.message);
        }
        else {
            (0, response_1.sendError)(res, result.message, 400);
        }
    }
    catch (error) {
        console.error('SMTP test connection error:', error);
        (0, response_1.sendError)(res, error.message || 'SMTP connection verification failed', 500);
    }
});
/**
 * POST /api/admin/settings/smtp/send-test
 * Dispatch a real test email to verify end-to-end delivery.
 */
router.post('/send-test', async (req, res) => {
    try {
        const tenantId = new mongoose_1.default.Types.ObjectId(req.auth.tenantId);
        const { toEmail } = req.body;
        if (!toEmail || !toEmail.includes('@')) {
            return (0, response_1.sendError)(res, 'Please provide a valid recipient email address', 400);
        }
        const result = await emailService_1.emailService.sendTestEmail({
            to: toEmail.trim(),
            tenantId,
        });
        if (result.success) {
            (0, response_1.sendSuccess)(res, { delivered: true }, result.message);
        }
        else {
            (0, response_1.sendError)(res, result.message, 400);
        }
    }
    catch (error) {
        console.error('SMTP send test email error:', error);
        (0, response_1.sendError)(res, error.message || 'Failed to dispatch test email', 500);
    }
});
exports.default = router;
//# sourceMappingURL=smtp-settings.js.map