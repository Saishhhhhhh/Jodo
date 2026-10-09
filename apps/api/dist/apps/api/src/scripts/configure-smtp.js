"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const Store_1 = require("../models/Store");
const crypto_1 = require("../utils/crypto");
const emailService_1 = require("../services/emailService");
async function configureSmtp() {
    console.log('📧 Setting up Gmail SMTP for kaverivalve51@gmail.com...');
    await (0, db_1.connectDB)();
    const email = 'kaverivalve51@gmail.com';
    // Standard Google App Passwords are 16 characters (spaces are optional display formatting)
    const rawPass = 'iwsr siss grhy blmb';
    const cleanPass = rawPass.replace(/\s+/g, '');
    const store = await Store_1.Store.findOne();
    if (!store) {
        console.error('❌ Store not found in DB');
        await (0, db_1.disconnectDB)();
        return;
    }
    const encryptedPassword = (0, crypto_1.encrypt)(cleanPass);
    const smtpSettings = {
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        username: email,
        encryptedPassword,
        encryption: 'STARTTLS',
        fromEmail: email,
        fromName: 'Jodo',
        isConfigured: true,
        updatedAt: new Date(),
    };
    store.settings = {
        ...store.settings,
        smtp: smtpSettings,
    };
    store.markModified('settings');
    await store.save();
    console.log('✅ SMTP configuration saved to database successfully with AES-256-GCM encrypted password!');
    console.log('\n🔍 Testing SMTP connection with Google SMTP servers...');
    const testResult = await emailService_1.emailService.verifySmtpConnection({
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
        const emailResult = await emailService_1.emailService.sendTestEmail({
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
    await (0, db_1.disconnectDB)();
}
configureSmtp().catch(async (err) => {
    console.error('Configuration failed:', err);
    await (0, db_1.disconnectDB)();
    process.exit(1);
});
//# sourceMappingURL=configure-smtp.js.map