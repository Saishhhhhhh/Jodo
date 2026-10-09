import mongoose from 'mongoose';
import { emailService } from '../services/emailService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jodo';

async function testContact() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  console.log('Testing sendContactFormEmails with Jodo logo...');
  const res = await emailService.sendContactFormEmails({
    firstName: 'Kaveri',
    lastName: 'Valve',
    email: 'kaverivalve51@gmail.com',
    phone: '+91 97639 90170',
    message: 'Hello Jodo team, I am interested in your custom solid wood sofa collections. Could you please share more details?',
  });

  console.log('Result:', res);
  await mongoose.disconnect();
  process.exit(0);
}

testContact().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
