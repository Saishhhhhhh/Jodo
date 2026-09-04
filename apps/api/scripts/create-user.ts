import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import { User } from '../src/models/User';
import { Tenant } from '../src/models/Tenant';
import { Store } from '../src/models/Store';

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const tenant = await Tenant.findOne();
    if (!tenant) throw new Error('No tenant found. Seed the db first.');

    const store = await Store.findOne();
    if (!store) throw new Error('No store found.');

    const email = 'chavansaish11@gmail.com';
    const password = 'Saish@123';
    const phone = '8669014705';

    // Check if user exists
    let user = await User.findOne({ email, tenantId: tenant._id });

    if (user) {
      console.log('User already exists. Updating password and phone...');
      user.passwordHash = password;
      user.phone = phone;
      await user.save();
      console.log('User updated successfully.');
    } else {
      console.log('Creating new admin user...');
      user = new User({
        tenantId: tenant._id,
        storeId: store._id,
        name: 'Saish Chavan',
        email,
        phone,
        passwordHash: password,
        status: 'active'
      });
      await user.save();
      console.log('User created successfully.');
    }
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();
