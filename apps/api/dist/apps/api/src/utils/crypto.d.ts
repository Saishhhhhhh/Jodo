/**
 * Encrypt sensitive strings (like SMTP passwords) using AES-256-GCM.
 * Output format: iv:authTag:encryptedHex
 */
export declare function encrypt(text: string): string;
/**
 * Decrypt strings encrypted with AES-256-GCM.
 */
export declare function decrypt(encryptedText: string): string;
/**
 * Generate cryptographically secure 6-digit numeric OTP.
 */
export declare function generateOtp(): string;
/**
 * Hash an OTP using SHA-256 with JWT secret as salt.
 * Ensures plain-text OTP is never stored in the database.
 */
export declare function hashOtp(otp: string): string;
/**
 * Mask an email address for privacy on verification screens.
 * Example: 'kaveri@gmail.com' -> 'ka****@gmail.com'
 * Example: 'a@example.com' -> 'a*@example.com'
 */
export declare function maskEmail(email: string): string;
