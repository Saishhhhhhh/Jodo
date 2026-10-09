import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Store } from '../models/Store';
import { decrypt } from '../utils/crypto';

export interface SmtpConfig {
  provider?: 'custom' | 'gmail' | 'outlook' | 'ses' | 'zoho' | 'other' | string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  encryption?: 'TLS' | 'STARTTLS' | 'NONE';
  fromEmail: string;
  fromName: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: any[];
}

export class EmailService {
  /**
   * Resolve active SMTP configuration from Store settings,
   * with fallback to process.env variables.
   */
  async getSmtpConfig(tenantId?: mongoose.Types.ObjectId | string): Promise<SmtpConfig | null> {
    try {
      const query = tenantId ? { tenantId: new mongoose.Types.ObjectId(tenantId) } : {};
      const store = await Store.findOne(query).lean();

      const smtpSettings = (store?.settings as any)?.smtp;

      if (smtpSettings && smtpSettings.host) {
        let password = smtpSettings.password || '';
        if (smtpSettings.encryptedPassword) {
          password = decrypt(smtpSettings.encryptedPassword);
        }

        return {
          provider: smtpSettings.provider || 'custom',
          host: smtpSettings.host,
          port: Number(smtpSettings.port) || 587,
          username: smtpSettings.username || '',
          password,
          encryption: smtpSettings.encryption || (Number(smtpSettings.port) === 465 ? 'TLS' : 'STARTTLS'),
          fromEmail: smtpSettings.fromEmail || store?.settings?.email || 'noreply@jodoshop.com',
          fromName: smtpSettings.fromName || store?.name || 'Jodo',
        };
      }
    } catch (err) {
      console.warn('[EmailService] Failed to load store SMTP config from database:', err);
    }

    // Fallback to environment variables if available
    if (process.env.SMTP_HOST) {
      return {
        provider: (process.env.SMTP_PROVIDER as any) || 'custom',
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        username: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASS || '',
        encryption: (process.env.SMTP_ENCRYPTION as any) || 'STARTTLS',
        fromEmail: process.env.SMTP_FROM || 'noreply@jodoshop.com',
        fromName: process.env.SMTP_FROM_NAME || 'Jodo',
      };
    }

    return null;
  }

  /**
   * Create Nodemailer transporter from a given configuration.
   */
  createTransporter(config: SmtpConfig): Transporter {
    const isTls = config.encryption === 'TLS' || config.port === 465;
    const isStartTls = config.encryption === 'STARTTLS';

    const transportOptions: any = {
      host: config.host,
      port: config.port,
      secure: isTls,
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert blocks in testing
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    };

    if (isStartTls && !isTls) {
      transportOptions.requireTLS = true;
    }

    if (config.username && config.password) {
      transportOptions.auth = {
        user: config.username,
        pass: config.password,
      };
    }

    return nodemailer.createTransport(transportOptions);
  }

  /**
   * Verify SMTP connection with given or current configuration.
   */
  async verifySmtpConnection(
    config?: SmtpConfig | null,
    tenantId?: mongoose.Types.ObjectId | string
  ): Promise<{ success: boolean; message: string }> {
    const activeConfig = config || (await this.getSmtpConfig(tenantId));

    if (!activeConfig || !activeConfig.host) {
      return {
        success: false,
        message: 'SMTP settings are not configured. Please fill in host, port, username, and password.',
      };
    }

    try {
      const transporter = this.createTransporter(activeConfig);
      await transporter.verify();
      return {
        success: true,
        message: 'SMTP connection verified successfully. Ready to send emails.',
      };
    } catch (error: any) {
      console.error('[EmailService] SMTP verification failed:', error);
      let message = error.message || 'SMTP connection failed';
      if (error.code === 'EAUTH') {
        message = 'SMTP authentication failed. Please verify your username and password.';
      } else if (error.code === 'ECONNREFUSED') {
        message = `Connection refused by server at ${activeConfig.host}:${activeConfig.port}. Check host and port.`;
      } else if (error.code === 'ETIMEDOUT') {
        message = `Connection to ${activeConfig.host}:${activeConfig.port} timed out. Check firewall or security settings.`;
      } else if (error.code === 'ESOCKET') {
        message = 'SSL/TLS handshake error. Please check your encryption setting (STARTTLS vs TLS).';
      }
      return { success: false, message };
    }
  }

  /**
   * Get Jodo Logo as an inline attachment for emails.
   */
  getLogoAttachment(): { filename: string; content: Buffer; cid: string; contentType: string } | null {
    const candidates = [
      path.join(__dirname, '../public/logo.png'),
      path.join(__dirname, '../assets/logo.png'),
      path.join(process.cwd(), 'public/logo.png'),
      path.join(process.cwd(), 'apps/api/public/logo.png'),
      path.join(process.cwd(), 'apps/web/public/logo.png'),
      path.resolve(__dirname, '../../../../apps/web/public/logo.png'),
      path.resolve(__dirname, '../../../../web/public/logo.png'),
      path.resolve(__dirname, '../../../../apps/admin/public/logo.png'),
    ];

    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          return {
            filename: 'jodo-logo.png',
            content: fs.readFileSync(p),
            cid: 'jodo-logo',
            contentType: 'image/png',
          };
        }
      } catch {
        // continue
      }
    }
    return null;
  }

  /**
   * Send an email with active SMTP configuration.
   */
  async sendEmail(
    options: SendEmailOptions,
    tenantId?: mongoose.Types.ObjectId | string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const config = await this.getSmtpConfig(tenantId);

    if (!config || !config.host) {
      console.warn(
        `[EmailService] ⚠️ SMTP not configured! Mocking outbound email to ${options.to}. Subject: "${options.subject}"`
      );
      return {
        success: false,
        error: 'SMTP not configured in admin settings.',
      };
    }

    try {
      const transporter = this.createTransporter(config);
      const senderEmail = config.fromEmail || 'kaverivalve51@gmail.com';
      const senderName = config.fromName || 'Jodo';
      const fromAddress = options.from || `"${senderName}" <${senderEmail}>`;

      const mailOptions: any = {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      };

      const attachments = [...(options.attachments || [])];
      if (options.html && options.html.includes('cid:jodo-logo')) {
        const logo = this.getLogoAttachment();
        if (logo) {
          attachments.push(logo);
        }
      }

      if (attachments.length > 0) {
        mailOptions.attachments = attachments;
      }

      const info = await transporter.sendMail(mailOptions);

      console.log(`[EmailService] ✉️ Email sent to ${options.to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(`[EmailService] ❌ Failed to send email to ${options.to}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send customer registration / verification 6-digit OTP email.
   */
  async sendVerificationOtp(params: {
    email: string;
    otp: string;
    customerName?: string;
    tenantId?: mongoose.Types.ObjectId | string;
  }): Promise<{ success: boolean; error?: string }> {
    const { email, otp, customerName = 'there', tenantId } = params;

    const subject = 'Verify your Jodo email address';

    // HTML Email Template matching Jodo brand aesthetic
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Jodo email address</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #f8f9fa;
      padding: 40px 15px;
      box-sizing: border-box;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      border: 1px solid #e9ecef;
      padding: 36px 32px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #f1f3f5;
      margin-bottom: 28px;
    }
    .brand {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #B65A45;
      text-transform: uppercase;
      margin: 0;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #212529;
      margin: 12px 0 0 0;
    }
    .greeting {
      font-size: 15px;
      color: #495057;
      margin-bottom: 16px;
    }
    .message {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 24px;
    }
    .otp-box {
      background-color: #FAF6F4;
      border: 1.5px dashed #B65A45;
      border-radius: 14px;
      padding: 20px 10px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #B65A45;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .otp-expiry {
      font-size: 12px;
      color: #868e96;
      margin-top: 8px;
      font-weight: 500;
    }
    .notice {
      font-size: 13px;
      color: #868e96;
      background-color: #f8f9fa;
      border-radius: 10px;
      padding: 12px 16px;
      margin-top: 24px;
      border: 1px solid #e9ecef;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #f1f3f5;
      font-size: 13px;
      color: #adb5bd;
    }
    .footer strong {
      color: #495057;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:jodo-logo" alt="JODO" style="height: 48px; max-width: 180px; object-fit: contain; margin: 0 auto 14px auto; display: block;" />
        <h2 class="title">Verify Your Email</h2>
      </div>

      <p class="greeting">Hi ${customerName},</p>
      
      <p class="message">
        Use the verification code below to verify your email address and activate your Jodo account:
      </p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">This verification code will expire in 10 minutes.</div>
      </div>

      <div class="notice">
        If you did not create a Jodo account, you can safely ignore this email.
      </div>

      <div class="footer">
        <p>Thanks,<br><strong>Jodo Team</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
JODO
Verify Your Email

Hi ${customerName},

Use the verification code below to verify your email address:

${otp}

This verification code will expire in 10 minutes.

If you did not create a Jodo account, you can safely ignore this email.

Thanks,
Jodo Team
    `.trim();

    return this.sendEmail(
      {
        to: email,
        from: '"Jodo" <kaverivalve51@gmail.com>',
        subject,
        html,
        text,
      },
      tenantId
    );
  }

  /**
   * Send a test email to verify SMTP configuration from Admin Panel.
   */
  async sendTestEmail(params: {
    to: string;
    config?: SmtpConfig | null;
    tenantId?: mongoose.Types.ObjectId | string;
  }): Promise<{ success: boolean; message: string }> {
    const { to, config, tenantId } = params;

    const activeConfig = config || (await this.getSmtpConfig(tenantId));

    if (!activeConfig || !activeConfig.host) {
      return {
        success: false,
        message: 'SMTP settings are not configured. Please configure host, port, username and password first.',
      };
    }

    const subject = 'Jodo SMTP Test Email';
    const timestamp = new Date().toLocaleString();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 20px; }
    .card { max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 16px; border: 1px solid #e9ecef; }
    .brand { color: #B65A45; font-size: 24px; font-weight: bold; margin: 0 0 16px 0; }
    .badge { display: inline-block; background: #e6fcf5; color: #0ca678; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
    .details { background: #f8f9fa; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="card">
    <img src="cid:jodo-logo" alt="JODO" style="height: 42px; max-width: 160px; object-fit: contain; margin: 0 0 16px 0; display: block;" />
    <span class="badge">SMTP Connection Verified</span>
    <h3 style="margin: 16px 0 8px 0; color: #212529;">Test Email Successful!</h3>
    <p style="color: #6c757d; font-size: 14px;">Your SMTP configuration is functioning properly. Outbound emails such as customer email verifications, order confirmations, and notifications can now be dispatched securely.</p>
    
    <div class="details">
      <strong>Server Host:</strong> ${activeConfig.host}<br>
      <strong>Port:</strong> ${activeConfig.port}<br>
      <strong>Encryption:</strong> ${activeConfig.encryption || 'Standard'}<br>
      <strong>Sender:</strong> ${activeConfig.fromName} &lt;${activeConfig.fromEmail}&gt;<br>
      <strong>Dispatched At:</strong> ${timestamp}
    </div>

    <p style="color: #868e96; font-size: 12px; margin-top: 20px;">Sent from Jodo Commerce OS Admin Settings.</p>
  </div>
</body>
</html>
    `;

    const text = `
JODO - SMTP Test Email
Your SMTP configuration has been tested successfully!

Server Host: ${activeConfig.host}
Port: ${activeConfig.port}
Sender: ${activeConfig.fromName} <${activeConfig.fromEmail}>
Dispatched At: ${timestamp}
    `.trim();

    try {
      const transporter = this.createTransporter(activeConfig);
      await transporter.sendMail({
        from: `"${activeConfig.fromName}" <${activeConfig.fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      return {
        success: true,
        message: `Test email sent successfully to ${to}. Please check your inbox.`,
      };
    } catch (error: any) {
      console.error('[EmailService] Test email failed:', error);
      let message = error.message || 'Failed to send test email';
      if (error.code === 'EAUTH') {
        message = 'SMTP authentication failed. Please check username/password.';
      } else if (error.code === 'ECONNREFUSED') {
        message = `Connection refused at ${activeConfig.host}:${activeConfig.port}. Check host and port.`;
      }
      return { success: false, message };
    }
  }

  /**
   * Send 6-digit OTP email for Forgot / Reset Password.
   */
  async sendPasswordResetOtp(params: {
    email: string;
    otp: string;
    customerName?: string;
    tenantId?: mongoose.Types.ObjectId | string;
  }): Promise<{ success: boolean; error?: string }> {
    const { email, otp, customerName = 'there', tenantId } = params;
    const subject = 'Reset Your Jodo Password: Verification Code';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Jodo Password</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .wrapper { width: 100%; background-color: #f8f9fa; padding: 40px 15px; }
    .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eaeaea; padding: 40px 32px; }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #B65A45; margin: 0 0 6px 0; }
    .title { font-size: 20px; font-weight: 700; color: #212529; margin: 0; }
    .greeting { font-size: 15px; color: #495057; margin-bottom: 16px; }
    .message { font-size: 14px; color: #6c757d; margin-bottom: 24px; line-height: 1.6; }
    .otp-box { background: linear-gradient(135deg, #FAF6F4 0%, #F5EBE6 100%); border: 1.5px dashed #B65A45; border-radius: 14px; padding: 22px 16px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #B65A45; margin: 0 0 8px 0; }
    .otp-expiry { font-size: 12px; color: #8c5d50; font-weight: 500; }
    .notice { font-size: 12px; color: #dc3545; background-color: #fff5f5; border-radius: 8px; padding: 12px; margin-top: 24px; border: 1px solid #fed7d7; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #adb5bd; border-top: 1px solid #f1f3f5; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:jodo-logo" alt="JODO" style="height: 48px; max-width: 180px; object-fit: contain; margin: 0 auto 14px auto; display: block;" />
        <h2 class="title">Password Reset Verification</h2>
      </div>

      <p class="greeting">Hi ${customerName},</p>
      
      <p class="message">
        We received a request to reset your Jodo account password. Enter the 6-digit verification code below to set a new password:
      </p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">This verification code expires in 10 minutes.</div>
      </div>

      <div class="notice">
        If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access.
      </div>

      <div class="footer">
        <p>Thanks,<br><strong>Jodo Team</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const text = `
JODO - Password Reset Verification

Hi ${customerName},

Use the 6-digit verification code below to reset your Jodo password:
${otp}

This code expires in 10 minutes.
If you did not request a password reset, you can safely ignore this email.

Thanks,
Jodo Team
    `.trim();

    return this.sendEmail(
      {
        to: email,
        from: '"Jodo" <kaverivalve51@gmail.com>',
        subject,
        html,
        text,
      },
      tenantId
    );
  }

  /**
   * Send 6-digit OTP email to confirm password change while logged in.
   */
  async sendPasswordChangeOtp(params: {
    email: string;
    otp: string;
    customerName?: string;
    tenantId?: mongoose.Types.ObjectId | string;
  }): Promise<{ success: boolean; error?: string }> {
    const { email, otp, customerName = 'there', tenantId } = params;
    const subject = 'Password Change Verification Code: Jodo';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Change Verification Code</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .wrapper { width: 100%; background-color: #f8f9fa; padding: 40px 15px; }
    .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #eaeaea; padding: 40px 32px; }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #B65A45; margin: 0 0 6px 0; }
    .title { font-size: 20px; font-weight: 700; color: #212529; margin: 0; }
    .greeting { font-size: 15px; color: #495057; margin-bottom: 16px; }
    .message { font-size: 14px; color: #6c757d; margin-bottom: 24px; line-height: 1.6; }
    .otp-box { background: linear-gradient(135deg, #FAF6F4 0%, #F5EBE6 100%); border: 1.5px dashed #B65A45; border-radius: 14px; padding: 22px 16px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #B65A45; margin: 0 0 8px 0; }
    .otp-expiry { font-size: 12px; color: #8c5d50; font-weight: 500; }
    .notice { font-size: 12px; color: #dc3545; background-color: #fff5f5; border-radius: 8px; padding: 12px; margin-top: 24px; border: 1px solid #fed7d7; }
    .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #adb5bd; border-top: 1px solid #f1f3f5; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:jodo-logo" alt="JODO" style="height: 48px; max-width: 180px; object-fit: contain; margin: 0 auto 14px auto; display: block;" />
        <h2 class="title">Confirm Password Change</h2>
      </div>

      <p class="greeting">Hi ${customerName},</p>
      
      <p class="message">
        You requested to update your account password. Use the 6-digit confirmation code below to verify this change:
      </p>

      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">This verification code expires in 10 minutes.</div>
      </div>

      <div class="notice">
        If you did not request to change your password, do not share this code with anyone and secure your account immediately.
      </div>

      <div class="footer">
        <p>Thanks,<br><strong>Jodo Team</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const text = `
JODO - Confirm Password Change

Hi ${customerName},

Use the 6-digit verification code below to verify your password change:
${otp}

This code expires in 10 minutes.

Thanks,
Jodo Team
    `.trim();

    return this.sendEmail(
      {
        to: email,
        from: '"Jodo" <kaverivalve51@gmail.com>',
        subject,
        html,
        text,
      },
      tenantId
    );
  }

  /**
   * Send notification email confirming password has been changed.
   */
  async sendPasswordChangedNotification(params: {
    email: string;
    customerName?: string;
    tenantId?: mongoose.Types.ObjectId | string;
  }): Promise<{ success: boolean; error?: string }> {
    const { email, customerName = 'there', tenantId } = params;
    const subject = 'Security Notice: Your Jodo Password Has Been Changed';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Jodo Password Has Been Changed</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; }
    .wrapper { width: 100%; padding: 40px 15px; background-color: #f8f9fa; }
    .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea; padding: 36px 28px; }
    .brand { font-size: 26px; font-weight: 800; color: #B65A45; margin: 0 0 16px 0; text-align: center; }
    .title { font-size: 18px; font-weight: 700; margin: 0 0 12px 0; }
    .text { font-size: 14px; color: #495057; line-height: 1.6; }
    .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f3f5; font-size: 12px; color: #adb5bd; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:jodo-logo" alt="JODO" style="height: 44px; max-width: 160px; object-fit: contain; margin: 0 auto 12px auto; display: block;" />
        <h2 class="title" style="margin: 0; color: #212529;">Password Changed Successfully</h2>
      </div>
      <p class="text">Hi ${customerName},</p>
      <p class="text">Your account password was recently changed. If you made this change, you can safely disregard this email.</p>
      <p class="text">If you did not make this change, please contact our support team immediately.</p>
      <div class="footer">Jodo Customer Support</div>
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.sendEmail(
      {
        to: email,
        from: '"Jodo" <kaverivalve51@gmail.com>',
        subject,
        html,
        text: `Hi ${customerName},\n\nYour Jodo account password has been changed. If you did not make this change, contact support immediately.`,
      },
      tenantId
    );
  }

  /**
   * Send Contact Us email:
   * 1. Alert store admin / recipient at kaverivalve51@gmail.com with inquiry details
   * 2. Send customer confirmation receipt to sender with Jodo logo
   */
  async sendContactFormEmails(params: {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    message: string;
    tenantId?: mongoose.Types.ObjectId | string;
  }): Promise<{ success: boolean; error?: string }> {
    const { firstName, lastName = '', email, phone, message, tenantId } = params;
    const fullName = `${firstName} ${lastName}`.trim();
    const config = await this.getSmtpConfig(tenantId);
    const adminRecipient = config?.fromEmail || 'kaverivalve51@gmail.com';

    // 1. Admin Alert Email
    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New Contact Us Message</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; }
    .wrapper { width: 100%; padding: 40px 15px; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea; padding: 36px 28px; }
    .header { text-align: center; border-bottom: 1px solid #f1f3f5; padding-bottom: 20px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 700; color: #212529; margin: 10px 0 0 0; }
    .field { margin-bottom: 14px; font-size: 14px; line-height: 1.6; }
    .label { font-weight: 600; color: #495057; display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { color: #212529; font-size: 15px; margin-top: 2px; }
    .message-box { background: #FAF6F4; border-left: 3px solid #B65A45; padding: 16px; border-radius: 8px; margin-top: 18px; font-size: 14px; color: #333; line-height: 1.6; }
    .footer { margin-top: 28px; font-size: 12px; color: #adb5bd; text-align: center; border-top: 1px solid #f1f3f5; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:jodo-logo" alt="JODO" style="height: 44px; max-width: 160px; object-fit: contain; margin: 0 auto 10px auto; display: block;" />
        <h2 class="title">New Contact Us Inquiry</h2>
      </div>
      <div class="field">
        <span class="label">Customer Name</span>
        <div class="value">${fullName}</div>
      </div>
      <div class="field">
        <span class="label">Email Address</span>
        <div class="value"><a href="mailto:${email}" style="color: #B65A45; text-decoration: none;">${email}</a></div>
      </div>
      ${phone ? `<div class="field"><span class="label">Phone Number</span><div class="value">${phone}</div></div>` : ''}
      <div class="field">
        <span class="label">Message</span>
        <div class="message-box">${message.replace(/\n/g, '<br/>')}</div>
      </div>
      <div class="footer">Received from Jodo Storefront Contact Page</div>
    </div>
  </div>
</body>
</html>
    `.trim();

    // 2. Customer Receipt Email
    const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>We Received Your Message - Jodo</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; }
    .wrapper { width: 100%; padding: 40px 15px; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea; padding: 36px 28px; }
    .header { text-align: center; border-bottom: 1px solid #f1f3f5; padding-bottom: 20px; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 700; color: #212529; margin: 10px 0 0 0; }
    .greeting { font-size: 15px; color: #495057; margin-bottom: 14px; }
    .body-text { font-size: 14px; color: #6c757d; line-height: 1.7; margin-bottom: 20px; }
    .summary { background: #fdfaf9; border-radius: 12px; padding: 16px; border: 1px solid #fae8e2; margin: 20px 0; font-size: 13px; color: #555; }
    .footer { margin-top: 28px; font-size: 12px; color: #adb5bd; text-align: center; border-top: 1px solid #f1f3f5; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:jodo-logo" alt="JODO" style="height: 46px; max-width: 170px; object-fit: contain; margin: 0 auto 10px auto; display: block;" />
        <h2 class="title">Thank You For Reaching Out</h2>
      </div>
      <p class="greeting">Hi ${firstName || 'there'},</p>
      <p class="body-text">
        Thank you for contacting Jodo! We have received your message and our team will get back to you within 24 hours.
      </p>
      <div class="summary">
        <strong>Your Message:</strong><br/>
        "${message.replace(/\n/g, '<br/>')}"
      </div>
      <div class="footer">
        Warm regards,<br/><strong>Jodo Customer Support</strong><br/>
        Email: ${adminRecipient}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      // Send notification to admin email
      await this.sendEmail({
        to: adminRecipient,
        from: '"Jodo Contact" <kaverivalve51@gmail.com>',
        subject: `New Contact Message from ${fullName}`,
        html: adminHtml,
        text: `New contact message from ${fullName} (${email}, ${phone || 'N/A'}):\n\n${message}`,
      }, tenantId);

      // Send auto-acknowledgement to customer
      await this.sendEmail({
        to: email,
        from: '"Jodo Support" <kaverivalve51@gmail.com>',
        subject: 'We Received Your Message: Jodo Support',
        html: customerHtml,
        text: `Hi ${firstName},\n\nThank you for contacting Jodo! We have received your message and will get back to you shortly.\n\nYour message: "${message}"\n\nJodo Support`,
      }, tenantId);

      return { success: true };
    } catch (err: any) {
      console.error('[EmailService] Failed to send contact form emails:', err);
      return { success: false, error: err.message };
    }
  }
}

export const emailService = new EmailService();
