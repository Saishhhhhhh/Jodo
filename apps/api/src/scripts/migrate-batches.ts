import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found');
    return;
  }
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) return;

  const qcCol = db.collection('qualitychecks');
  const prodCol = db.collection('productionorders');

  const batchMap: Record<string, string> = {
    'BATCH-FY26-27-01': 'BATCH-2026-01',
    'BATCH-FY26-27-02': 'BATCH-2026-02',
    'BATCH-FY26-27-03': 'BATCH-2026-03',
    'BATCH-FY26-27-04': 'BATCH-2026-04',
    'BATCH-26A-01': 'BATCH-2026-01',
    'BATCH-26A-02': 'BATCH-2026-02',
    'BATCH-26B-05': 'BATCH-2026-03',
    'BATCH-26C-12': 'BATCH-2026-04',
  };

  for (const [oldB, newB] of Object.entries(batchMap)) {
    const r1 = await qcCol.updateMany({ batchId: oldB }, { $set: { batchId: newB } });
    const r2 = await prodCol.updateMany({ batchNumber: oldB }, { $set: { batchNumber: newB } });
    if (r1.modifiedCount > 0 || r2.modifiedCount > 0) {
      console.log(`Updated ${oldB} -> ${newB}: QC ${r1.modifiedCount}, Prod ${r2.modifiedCount}`);
    }
  }

  await mongoose.disconnect();
  console.log('Finished updating batch numbers to year-wise BATCH-2026-XX');
}

run().catch(console.error);
