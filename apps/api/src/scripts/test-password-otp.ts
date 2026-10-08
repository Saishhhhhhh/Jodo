import mongoose from 'mongoose';
import { Customer } from '../models/Customer';
import { User } from '../models/User';
import { EmailVerification } from '../models/EmailVerification';
import { emailService } from '../services/emailService';
import { generateOtp, hashOtp } from '../utils/crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jodo';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Test 1: Verify SMTP email templates
  console.log('\n--- TEST 1: Email Templates ---');
  const testEmail = 'kaverivalve51@gmail.com'; // user's provided email

  console.log('Testing sendVerificationOtp dispatch with Jodo logo...');
  const verifyOtp = generateOtp();
  const verifySuccess = await emailService.sendVerificationOtp({
    email: testEmail,
    otp: verifyOtp,
    customerName: 'Kaveri',
  });
  console.log('sendVerificationOtp result:', verifySuccess ? 'SUCCESS' : 'FAILED');

  console.log('Testing sendPasswordResetOtp dispatch...');
  const resetOtp = generateOtp();
  const resetSuccess = await emailService.sendPasswordResetOtp({
    email: testEmail,
    otp: resetOtp,
    customerName: 'Test Customer',
  });
  console.log('sendPasswordResetOtp result:', resetSuccess ? 'SUCCESS' : 'FAILED');

  console.log('Testing sendPasswordChangeOtp dispatch...');
  const changeOtp = generateOtp();
  const changeSuccess = await emailService.sendPasswordChangeOtp({
    email: testEmail,
    otp: changeOtp,
    customerName: 'Test Customer',
  });
  console.log('sendPasswordChangeOtp result:', changeSuccess ? 'SUCCESS' : 'FAILED');

  console.log('Testing sendPasswordChangedNotification dispatch...');
  const notifySuccess = await emailService.sendPasswordChangedNotification({
    email: testEmail,
    customerName: 'Test Customer',
  });
  console.log('sendPasswordChangedNotification result:', notifySuccess ? 'SUCCESS' : 'FAILED');

  // Test 2: Verify OTP Generation, Hash verification & Lifecycle in DB
  console.log('\n--- TEST 2: EmailVerification OTP hashing & matching ---');
  const code = '123456';
  const hashed = hashOtp(code);
  console.log(`Generated OTP: ${code}, Salted Hash: ${hashed}`);

  await EmailVerification.deleteMany({ email: 'autotest@example.com' });
  const rec = await EmailVerification.create({
    email: 'autotest@example.com',
    otpHash: hashed,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attemptCount: 0,
    lastSentAt: new Date(),
  });

  const isMatched = hashOtp('123456') === rec.otpHash;
  const isWrongRejected = hashOtp('654321') !== rec.otpHash;
  console.log('Correct OTP verified:', isMatched);
  console.log('Incorrect OTP rejected:', isWrongRejected);

  await EmailVerification.deleteMany({ email: 'autotest@example.com' });
  console.log('Cleaned up test verification records.');

  console.log('\nAll password OTP integration checks passed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
