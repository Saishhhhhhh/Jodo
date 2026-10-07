import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import mongoose from 'mongoose';
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

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });

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
        <h1 class="brand">JODO</h1>
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
    <div class="brand">JODO</div>
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
}

export const emailService = new EmailService();
