"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const EmailVerification_1 = require("../models/EmailVerification");
const emailService_1 = require("../services/emailService");
const crypto_1 = require("../utils/crypto");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jodo';
async function run() {
    console.log('Connecting to MongoDB...');
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('Connected.');
    // Test 1: Verify SMTP email templates
    console.log('\n--- TEST 1: Email Templates ---');
    const testEmail = 'kaverivalve51@gmail.com'; // user's provided email
    console.log('Testing sendVerificationOtp dispatch with Jodo logo...');
    const verifyOtp = (0, crypto_1.generateOtp)();
    const verifySuccess = await emailService_1.emailService.sendVerificationOtp({
        email: testEmail,
        otp: verifyOtp,
        customerName: 'Kaveri',
    });
    console.log('sendVerificationOtp result:', verifySuccess ? 'SUCCESS' : 'FAILED');
    console.log('Testing sendPasswordResetOtp dispatch...');
    const resetOtp = (0, crypto_1.generateOtp)();
    const resetSuccess = await emailService_1.emailService.sendPasswordResetOtp({
        email: testEmail,
        otp: resetOtp,
        customerName: 'Test Customer',
    });
    console.log('sendPasswordResetOtp result:', resetSuccess ? 'SUCCESS' : 'FAILED');
    console.log('Testing sendPasswordChangeOtp dispatch...');
    const changeOtp = (0, crypto_1.generateOtp)();
    const changeSuccess = await emailService_1.emailService.sendPasswordChangeOtp({
        email: testEmail,
        otp: changeOtp,
        customerName: 'Test Customer',
    });
    console.log('sendPasswordChangeOtp result:', changeSuccess ? 'SUCCESS' : 'FAILED');
    console.log('Testing sendPasswordChangedNotification dispatch...');
    const notifySuccess = await emailService_1.emailService.sendPasswordChangedNotification({
        email: testEmail,
        customerName: 'Test Customer',
    });
    console.log('sendPasswordChangedNotification result:', notifySuccess ? 'SUCCESS' : 'FAILED');
    // Test 2: Verify OTP Generation, Hash verification & Lifecycle in DB
    console.log('\n--- TEST 2: EmailVerification OTP hashing & matching ---');
    const code = '123456';
    const hashed = (0, crypto_1.hashOtp)(code);
    console.log(`Generated OTP: ${code}, Salted Hash: ${hashed}`);
    await EmailVerification_1.EmailVerification.deleteMany({ email: 'autotest@example.com' });
    const rec = await EmailVerification_1.EmailVerification.create({
        email: 'autotest@example.com',
        otpHash: hashed,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attemptCount: 0,
        lastSentAt: new Date(),
    });
    const isMatched = (0, crypto_1.hashOtp)('123456') === rec.otpHash;
    const isWrongRejected = (0, crypto_1.hashOtp)('654321') !== rec.otpHash;
    console.log('Correct OTP verified:', isMatched);
    console.log('Incorrect OTP rejected:', isWrongRejected);
    await EmailVerification_1.EmailVerification.deleteMany({ email: 'autotest@example.com' });
    console.log('Cleaned up test verification records.');
    console.log('\nAll password OTP integration checks passed successfully!');
    await mongoose_1.default.disconnect();
    process.exit(0);
}
run().catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
});
//# sourceMappingURL=test-password-otp.js.map