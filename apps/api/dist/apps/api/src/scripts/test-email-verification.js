"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const Customer_1 = require("../models/Customer");
const Store_1 = require("../models/Store");
const EmailVerification_1 = require("../models/EmailVerification");
const crypto_1 = require("../utils/crypto");
const axios_1 = __importDefault(require("axios"));
const API_BASE = 'http://localhost:4000/api';
async function runTests() {
    console.log('🧪 ========================================================');
    console.log('🧪 Starting Email Verification & SMTP Test Suite');
    console.log('🧪 ========================================================');
    await (0, db_1.connectDB)();
    const testEmail = `test.customer.${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const testFirstName = 'Test';
    const testLastName = 'Customer';
    console.log(`\n📋 Test 1: Customer Registration Email Verification Flow`);
    // 1. Register customer
    const regRes = await axios_1.default.post(`${API_BASE}/storefront/auth/register`, {
        firstName: testFirstName,
        lastName: testLastName,
        email: testEmail,
        password: testPassword,
    });
    console.log('Register response status:', regRes.status);
    console.log('Register response body:', regRes.data);
    if (!regRes.data.success || !regRes.data.data?.requiresVerification) {
        throw new Error('Registration failed to return requiresVerification: true');
    }
    console.log('✅ Registration returned requiresVerification: true and masked email:', regRes.data.data.maskedEmail);
    // Check customer record in DB
    const createdCustomer = await Customer_1.Customer.findOne({ email: testEmail });
    if (!createdCustomer)
        throw new Error('Customer not found in DB');
    if (createdCustomer.isEmailVerified !== false) {
        throw new Error(`Expected isEmailVerified to be false, got: ${createdCustomer.isEmailVerified}`);
    }
    if (createdCustomer.emailVerifiedAt !== null && createdCustomer.emailVerifiedAt !== undefined) {
        throw new Error(`Expected emailVerifiedAt to be null, got: ${createdCustomer.emailVerifiedAt}`);
    }
    console.log('✅ Customer in DB has isEmailVerified: false, emailVerifiedAt: null');
    // Check EmailVerification record in DB
    const otpRecord = await EmailVerification_1.EmailVerification.findOne({ email: testEmail });
    if (!otpRecord)
        throw new Error('EmailVerification record not found in DB');
    console.log('✅ Found EmailVerification record in DB. Expires at:', otpRecord.expiresAt);
    console.log(`\n📋 Test 2: Verify with Wrong OTP`);
    try {
        await axios_1.default.post(`${API_BASE}/storefront/auth/verify-otp`, {
            email: testEmail,
            otp: '000000',
        });
        throw new Error('Expected wrong OTP to fail');
    }
    catch (err) {
        if (err.response?.status === 400) {
            console.log('✅ Wrong OTP rejected with 400 error:', err.response.data.message);
        }
        else {
            throw err;
        }
    }
    // Check attempt count incremented
    const updatedOtpRecord = await EmailVerification_1.EmailVerification.findOne({ email: testEmail });
    if (updatedOtpRecord?.attemptCount !== 1) {
        throw new Error(`Expected attemptCount: 1, got ${updatedOtpRecord?.attemptCount}`);
    }
    console.log('✅ attemptCount incremented to 1');
    console.log(`\n📋 Test 3: Resend OTP Cooldown Enforcement`);
    try {
        await axios_1.default.post(`${API_BASE}/storefront/auth/resend-otp`, { email: testEmail });
        throw new Error('Expected 60s cooldown to block immediate resend');
    }
    catch (err) {
        if (err.response?.status === 429) {
            console.log('✅ Resend blocked by 60s cooldown (429):', err.response.data.message);
        }
        else {
            throw err;
        }
    }
    console.log(`\n📋 Test 4: Successful OTP Verification`);
    // Generate a known test OTP and update the record for testing verification
    const knownOtp = '789123';
    await EmailVerification_1.EmailVerification.updateOne({ email: testEmail }, { $set: { otpHash: (0, crypto_1.hashOtp)(knownOtp), expiresAt: new Date(Date.now() + 600000) } });
    const verifyRes = await axios_1.default.post(`${API_BASE}/storefront/auth/verify-otp`, {
        email: testEmail,
        otp: knownOtp,
    });
    if (!verifyRes.data.success || !verifyRes.data.data?.token) {
        throw new Error('Verification failed to return token');
    }
    console.log('✅ OTP verified successfully! Received JWT access token.');
    // Check customer is verified now
    const verifiedCustomer = await Customer_1.Customer.findOne({ email: testEmail });
    if (verifiedCustomer?.isEmailVerified !== true) {
        throw new Error('Expected customer to be verified now');
    }
    if (!verifiedCustomer?.emailVerifiedAt) {
        throw new Error('Expected customer emailVerifiedAt to be set');
    }
    console.log('✅ Customer isEmailVerified is now true, verifiedAt:', verifiedCustomer.emailVerifiedAt);
    // Check OTP records purged
    const remainingOtps = await EmailVerification_1.EmailVerification.countDocuments({ email: testEmail });
    if (remainingOtps !== 0) {
        throw new Error(`Expected 0 remaining OTP records, found: ${remainingOtps}`);
    }
    console.log('✅ EmailVerification record deleted after successful verification');
    console.log(`\n📋 Test 5: Login with Verified Account`);
    const loginRes = await axios_1.default.post(`${API_BASE}/storefront/auth/login`, {
        email: testEmail,
        password: testPassword,
    });
    if (!loginRes.data.success || !loginRes.data.data?.token) {
        throw new Error('Login with verified account failed');
    }
    console.log('✅ Verified account logged in successfully! Received token.');
    console.log(`\n📋 Test 6: Login with Unverified Account`);
    // Create an unverified customer
    const unverifiedEmail = `unverified.${Date.now()}@example.com`;
    await axios_1.default.post(`${API_BASE}/storefront/auth/register`, {
        firstName: 'Unverified',
        lastName: 'User',
        email: unverifiedEmail,
        password: testPassword,
    });
    // Attempt login with valid credentials
    const unverifiedLoginRes = await axios_1.default.post(`${API_BASE}/storefront/auth/login`, {
        email: unverifiedEmail,
        password: testPassword,
    });
    if (unverifiedLoginRes.data.data?.requiresVerification !== true) {
        throw new Error('Expected requiresVerification: true for unverified login');
    }
    console.log('✅ Unverified account login correctly blocked and redirected with requiresVerification: true');
    // Attempt login with wrong password
    try {
        await axios_1.default.post(`${API_BASE}/storefront/auth/login`, {
            email: unverifiedEmail,
            password: 'wrongpassword',
        });
        throw new Error('Expected 401 on wrong password');
    }
    catch (err) {
        if (err.response?.status === 401) {
            console.log('✅ Wrong password rejected with 401 without revealing verification status');
        }
        else {
            throw err;
        }
    }
    console.log(`\n📋 Test 7: Encryption & Masking Utility Functions`);
    const secret = 'mySuperSecretPassword123!';
    const encrypted = (0, crypto_1.encrypt)(secret);
    const decrypted = (0, crypto_1.decrypt)(encrypted);
    if (decrypted !== secret) {
        throw new Error(`Encryption roundtrip failed: ${decrypted} !== ${secret}`);
    }
    console.log('✅ AES-256-GCM encryption and decryption roundtrip successful');
    const masked = (0, crypto_1.maskEmail)('kaveri.valve@jodo.dev');
    console.log('Masked email example:', masked);
    if (!masked.startsWith('ka') || !masked.endsWith('@jodo.dev')) {
        throw new Error(`Unexpected masked email format: ${masked}`);
    }
    console.log('✅ Email masking function verified');
    console.log(`\n📋 Test 8: Admin SMTP Settings API`);
    // Login as admin to get token
    const adminLoginRes = await axios_1.default.post(`${API_BASE}/admin/auth/login`, {
        email: 'admin@jodo.dev',
        password: 'password123',
    }).catch(async () => {
        // Try Admin@123456
        return axios_1.default.post(`${API_BASE}/admin/auth/login`, {
            email: 'admin@jodo.dev',
            password: 'Admin@123456',
        });
    });
    const adminToken = adminLoginRes.data.data?.accessToken;
    if (!adminToken) {
        throw new Error('Admin login failed');
    }
    console.log('✅ Admin authenticated successfully.');
    const authHeaders = { Authorization: `Bearer ${adminToken}` };
    // GET SMTP Settings
    const getSmtpRes = await axios_1.default.get(`${API_BASE}/admin/settings/smtp`, { headers: authHeaders });
    console.log('GET SMTP Settings response:', getSmtpRes.data);
    if (!getSmtpRes.data.success)
        throw new Error('GET SMTP settings failed');
    if ('password' in getSmtpRes.data.data) {
        throw new Error('Plain password must never be present in GET SMTP settings response!');
    }
    console.log('✅ GET SMTP settings returned without exposing plain password');
    // PUT SMTP Settings
    const putSmtpRes = await axios_1.default.put(`${API_BASE}/admin/settings/smtp`, {
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        username: 'jodo.notifications@gmail.com',
        password: 'abcd-efgh-ijkl-mnop',
        encryption: 'STARTTLS',
        fromEmail: 'jodo.notifications@gmail.com',
        fromName: 'Jodo Store',
    }, { headers: authHeaders });
    console.log('PUT SMTP Settings response:', putSmtpRes.data);
    if (!putSmtpRes.data.success || putSmtpRes.data.data.smtpPasswordConfigured !== true) {
        throw new Error('PUT SMTP settings failed or smtpPasswordConfigured is not true');
    }
    if ('password' in putSmtpRes.data.data) {
        throw new Error('Plain password must not be returned in PUT response!');
    }
    console.log('✅ PUT SMTP settings saved encrypted password and returned smtpPasswordConfigured: true');
    // Verify encrypted password in MongoDB
    const store = await Store_1.Store.findOne();
    const savedSmtp = store?.settings?.smtp;
    if (!savedSmtp?.encryptedPassword) {
        throw new Error('Password was not encrypted in MongoDB store settings');
    }
    const decryptedPass = (0, crypto_1.decrypt)(savedSmtp.encryptedPassword);
    if (decryptedPass !== 'abcd-efgh-ijkl-mnop') {
        throw new Error(`Decrypted password mismatch: ${decryptedPass}`);
    }
    console.log('✅ Verified password stored encrypted in MongoDB and decrypts correctly.');
    // Clean up test customers
    await Customer_1.Customer.deleteMany({ email: { $in: [testEmail, unverifiedEmail] } });
    await EmailVerification_1.EmailVerification.deleteMany({ email: { $in: [testEmail, unverifiedEmail] } });
    console.log('\n🎉 ========================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!');
    console.log('🎉 ========================================================');
    await (0, db_1.disconnectDB)();
    process.exit(0);
}
runTests().catch(async (err) => {
    console.error('❌ Test failed with error:', err.response?.data || err.message);
    await (0, db_1.disconnectDB)();
    process.exit(1);
});
//# sourceMappingURL=test-email-verification.js.map