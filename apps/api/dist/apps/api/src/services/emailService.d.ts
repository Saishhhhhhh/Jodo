import type { Transporter } from 'nodemailer';
import mongoose from 'mongoose';
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
export declare class EmailService {
    /**
     * Resolve active SMTP configuration from Store settings,
     * with fallback to process.env variables.
     */
    getSmtpConfig(tenantId?: mongoose.Types.ObjectId | string): Promise<SmtpConfig | null>;
    /**
     * Create Nodemailer transporter from a given configuration.
     */
    createTransporter(config: SmtpConfig): Transporter;
    /**
     * Verify SMTP connection with given or current configuration.
     */
    verifySmtpConnection(config?: SmtpConfig | null, tenantId?: mongoose.Types.ObjectId | string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get Jodo Logo as an inline attachment for emails.
     */
    getLogoAttachment(): {
        filename: string;
        content: Buffer;
        cid: string;
        contentType: string;
    } | null;
    /**
     * Send an email with active SMTP configuration.
     */
    sendEmail(options: SendEmailOptions, tenantId?: mongoose.Types.ObjectId | string): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Send customer registration / verification 6-digit OTP email.
     */
    sendVerificationOtp(params: {
        email: string;
        otp: string;
        customerName?: string;
        tenantId?: mongoose.Types.ObjectId | string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Send a test email to verify SMTP configuration from Admin Panel.
     */
    sendTestEmail(params: {
        to: string;
        config?: SmtpConfig | null;
        tenantId?: mongoose.Types.ObjectId | string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Send 6-digit OTP email for Forgot / Reset Password.
     */
    sendPasswordResetOtp(params: {
        email: string;
        otp: string;
        customerName?: string;
        tenantId?: mongoose.Types.ObjectId | string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Send 6-digit OTP email to confirm password change while logged in.
     */
    sendPasswordChangeOtp(params: {
        email: string;
        otp: string;
        customerName?: string;
        tenantId?: mongoose.Types.ObjectId | string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Send notification email confirming password has been changed.
     */
    sendPasswordChangedNotification(params: {
        email: string;
        customerName?: string;
        tenantId?: mongoose.Types.ObjectId | string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Send Contact Us email:
     * 1. Alert store admin / recipient at kaverivalve51@gmail.com with inquiry details
     * 2. Send customer confirmation receipt to sender with Jodo logo
     */
    sendContactFormEmails(params: {
        firstName: string;
        lastName?: string;
        email: string;
        phone?: string;
        message: string;
        tenantId?: mongoose.Types.ObjectId | string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
}
export declare const emailService: EmailService;
