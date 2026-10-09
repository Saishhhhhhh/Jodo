"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const Customer_1 = require("../models/Customer");
const User_1 = require("../models/User");
async function migrate() {
    console.log('🔄 Running email verification status migration for existing records...');
    await (0, db_1.connectDB)();
    // Mark existing customers as verified so legacy accounts are not blocked
    const customerResult = await Customer_1.Customer.updateMany({ isEmailVerified: { $exists: false } }, { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } });
    console.log(`✅ Updated ${customerResult.modifiedCount} existing customer accounts to isEmailVerified: true`);
    // Ensure all existing staff/admin users are verified
    const userResult = await User_1.User.updateMany({ isEmailVerified: { $ne: true } }, { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } });
    console.log(`✅ Updated ${userResult.modifiedCount} existing staff user accounts to isEmailVerified: true`);
    console.log('🎉 Migration completed successfully.');
    await (0, db_1.disconnectDB)();
}
migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-email-verification.js.map