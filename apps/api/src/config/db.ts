import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: 'jodo_commerce',
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // process.exit(1);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('🔌 MongoDB disconnected');
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});
