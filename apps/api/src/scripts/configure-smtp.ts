import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Store } from '../models/Store';
import { encrypt } from '../utils/crypto';
import { emailService } from '../services/emailService';

async function configureSmtp() {
  console.log('📧 Setting up Gmail SMTP for kaverivalve51@gmail.com...');
  await connectDB();

  const email = 'kaverivalve51@gmail.com';
  // Standard Google App Passwords are 16 characters (spaces are optional display formatting)
  const rawPass = 'iwsr siss grhy blmb';
  const cleanPass = rawPass.replace(/\s+/g, '');

  const store = await Store.findOne();
  if (!store) {
    console.error('❌ Store not found in DB');
    await disconnectDB();
    return;
  }

  const encryptedPassword = encrypt(cleanPass);

  const smtpSettings = {
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    username: email,
    encryptedPassword,
    encryption: 'STARTTLS' as const,
    fromEmail: email,
    fromName: 'Jodo',
    isConfigured: true,
    updatedAt: new Date(),
  };

  store.settings = {
    ...(store.settings as Record<string, unknown>),
    smtp: smtpSettings,
  };
  store.markModified('settings');
  await store.save();

  console.log('✅ SMTP configuration saved to database successfully with AES-256-GCM encrypted password!');

  console.log('\n🔍 Testing SMTP connection with Google SMTP servers...');
  const testResult = await emailService.verifySmtpConnection({
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    username: email,
    password: cleanPass,
    encryption: 'STARTTLS',
    fromEmail: email,
    fromName: 'Jodo',
  });

  console.log('Connection Test Result:', testResult);

  if (testResult.success) {
    console.log('\n📬 Sending live test email to:', email);
    const emailResult = await emailService.sendTestEmail({
      to: email,
      config: {
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        username: email,
        password: cleanPass,
        encryption: 'STARTTLS',
        fromEmail: email,
        fromName: 'Jodo',
      },
      tenantId: store.tenantId,
    });
    console.log('Live Email Result:', emailResult);
  }

  await disconnectDB();
}

configureSmtp().catch(async (err) => {
  console.error('Configuration failed:', err);
  await disconnectDB();
  process.exit(1);
});
