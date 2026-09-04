import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { Lead } from '../src/models/Lead';
import { Store } from '../src/models/Store';

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to DB');

  const store = await Store.findOne();
  if (!store) {
    console.log('No store found');
    process.exit(1);
  }

  await Lead.deleteMany({});
  
  await Lead.create({
    tenantId: store.tenantId,
    storeId: store._id,
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '+15550123456',
    source: 'Website',
    status: 'New',
    interestLevel: 'High',
    followUpPriority: 'High',
    productRequirement: 'Looking for a durable resistance band set',
    budget: '$50',
    location: 'Los Angeles, CA',
    notes: 'Contact ASAP before she buys from a competitor.',
  });

  await Lead.create({
    tenantId: store.tenantId,
    storeId: store._id,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+14445556666',
    source: 'Instagram',
    status: 'Contacted',
    interestLevel: 'Medium',
    followUpPriority: 'Medium',
    notes: 'Asked about shipping times in DM.',
  });

  console.log('Created test leads!');
  process.exit(0);
}

seed().catch(console.error);
