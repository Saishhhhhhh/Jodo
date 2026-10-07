import crypto from 'crypto';
import { env } from '../config/env';

// Derive 32-byte key for AES-256-GCM encryption using scrypt and JWT secret
const ENCRYPTION_SALT = 'jodo-smtp-secret-salt-v1';
const KEY = crypto.scryptSync(env.JWT_ACCESS_SECRET || 'jodo-default-secret-key-32chars!!', ENCRYPTION_SALT, 32);

/**
 * Encrypt sensitive strings (like SMTP passwords) using AES-256-GCM.
 * Output format: iv:authTag:encryptedHex
 */
export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt strings encrypted with AES-256-GCM.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      // If it wasn't encrypted in this format, return as-is (for backward compatibility)
      return encryptedText;
    }
    const [ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Generate cryptographically secure 6-digit numeric OTP.
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP using SHA-256 with JWT secret as salt.
 * Ensures plain-text OTP is never stored in the database.
 */
export function hashOtp(otp: string): string {
  return crypto
    .createHash('sha256')
    .update(`${otp}:${env.JWT_ACCESS_SECRET || 'jodo-salt'}`)
    .digest('hex');
}

/**
 * Mask an email address for privacy on verification screens.
 * Example: 'kaveri@gmail.com' -> 'ka****@gmail.com'
 * Example: 'a@example.com' -> 'a*@example.com'
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || '';
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}*@${domain}`;
  }
  const prefix = name.slice(0, 2);
  const stars = '*'.repeat(Math.max(2, name.length - 2));
  return `${prefix}${stars}@${domain}`;
}
