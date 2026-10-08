"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const emailService_1 = require("../services/emailService");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jodo';
async function testContact() {
    console.log('Connecting to MongoDB...');
    await mongoose_1.default.connect(MONGODB_URI);
    console.log('Connected.');
    console.log('Testing sendContactFormEmails with Jodo logo...');
    const res = await emailService_1.emailService.sendContactFormEmails({
        firstName: 'Kaveri',
        lastName: 'Valve',
        email: 'kaverivalve51@gmail.com',
        phone: '+91 97639 90170',
        message: 'Hello Jodo team, I am interested in your custom solid wood sofa collections. Could you please share more details?',
    });
    console.log('Result:', res);
    await mongoose_1.default.disconnect();
    process.exit(0);
}
testContact().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
});
//# sourceMappingURL=test-contact-email.js.map