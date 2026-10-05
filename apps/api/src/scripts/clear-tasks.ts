import '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Task } from '../models/Task';

async function clearAllTasks() {
  try {
    await connectDB();
    const result = await Task.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} tasks from database.`);
  } catch (error) {
    console.error('Error clearing tasks:', error);
  } finally {
    await disconnectDB();
  }
}

clearAllTasks();
