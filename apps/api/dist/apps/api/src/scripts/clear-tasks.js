"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const db_1 = require("../config/db");
const Task_1 = require("../models/Task");
async function clearAllTasks() {
    try {
        await (0, db_1.connectDB)();
        const result = await Task_1.Task.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} tasks from database.`);
    }
    catch (error) {
        console.error('Error clearing tasks:', error);
    }
    finally {
        await (0, db_1.disconnectDB)();
    }
}
clearAllTasks();
//# sourceMappingURL=clear-tasks.js.map