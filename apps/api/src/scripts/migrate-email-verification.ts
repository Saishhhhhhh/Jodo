import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Customer } from '../models/Customer';
import { User } from '../models/User';

async function migrate() {
  console.log('🔄 Running email verification status migration for existing records...');
  await connectDB();

  // Mark existing customers as verified so legacy accounts are not blocked
  const customerResult = await Customer.updateMany(
    { isEmailVerified: { $exists: false } },
    { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
  );
  console.log(`✅ Updated ${customerResult.modifiedCount} existing customer accounts to isEmailVerified: true`);

  // Ensure all existing staff/admin users are verified
  const userResult = await User.updateMany(
    { isEmailVerified: { $ne: true } },
    { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
  );
  console.log(`✅ Updated ${userResult.modifiedCount} existing staff user accounts to isEmailVerified: true`);

  console.log('🎉 Migration completed successfully.');
  await disconnectDB();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
