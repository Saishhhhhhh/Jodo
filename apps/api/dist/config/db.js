"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let isConnected = false;
async function connectDB() {
    if (isConnected)
        return;
    try {
        const conn = await mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            dbName: 'jodo_commerce',
        });
        isConnected = true;
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}
async function disconnectDB() {
    if (!isConnected)
        return;
    await mongoose_1.default.disconnect();
    isConnected = false;
    console.log('🔌 MongoDB disconnected');
}
// Handle connection events
mongoose_1.default.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ MongoDB disconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});
//# sourceMappingURL=db.js.map