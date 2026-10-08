"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.maskEmail = maskEmail;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
// Derive 32-byte key for AES-256-GCM encryption using scrypt and JWT secret
const ENCRYPTION_SALT = 'jodo-smtp-secret-salt-v1';
const KEY = crypto_1.default.scryptSync(env_1.env.JWT_ACCESS_SECRET || 'jodo-default-secret-key-32chars!!', ENCRYPTION_SALT, 32);
/**
 * Encrypt sensitive strings (like SMTP passwords) using AES-256-GCM.
 * Output format: iv:authTag:encryptedHex
 */
function encrypt(text) {
    if (!text)
        return '';
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv('aes-256-gcm', KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
/**
 * Decrypt strings encrypted with AES-256-GCM.
 */
function decrypt(encryptedText) {
    if (!encryptedText)
        return '';
    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            // If it wasn't encrypted in this format, return as-is (for backward compatibility)
            return encryptedText;
        }
        const [ivHex, authTagHex, cipherHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', KEY, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
}
/**
 * Generate cryptographically secure 6-digit numeric OTP.
 */
function generateOtp() {
    return crypto_1.default.randomInt(100000, 1000000).toString();
}
/**
 * Hash an OTP using SHA-256 with JWT secret as salt.
 * Ensures plain-text OTP is never stored in the database.
 */
function hashOtp(otp) {
    return crypto_1.default
        .createHash('sha256')
        .update(`${otp}:${env_1.env.JWT_ACCESS_SECRET || 'jodo-salt'}`)
        .digest('hex');
}
/**
 * Mask an email address for privacy on verification screens.
 * Example: 'kaveri@gmail.com' -> 'ka****@gmail.com'
 * Example: 'a@example.com' -> 'a*@example.com'
 */
function maskEmail(email) {
    if (!email || !email.includes('@'))
        return email || '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) {
        return `${name[0]}*@${domain}`;
    }
    const prefix = name.slice(0, 2);
    const stars = '*'.repeat(Math.max(2, name.length - 2));
    return `${prefix}${stars}@${domain}`;
}
//# sourceMappingURL=crypto.js.map