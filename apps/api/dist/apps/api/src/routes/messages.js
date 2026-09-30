"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Message_1 = require("../models/Message");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
// Get messages
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const storeId = req.user?.storeId || req.storeId;
        const { module, recordId, isRead } = req.query;
        let query = { storeId };
        if (module)
            query.relatedModule = module;
        if (recordId && mongoose_1.default.Types.ObjectId.isValid(recordId)) {
            query.relatedRecordId = recordId;
        }
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        const messages = await Message_1.Message.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: messages });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// Mark as read
router.patch('/:id/read', auth_1.requireAuth, async (req, res) => {
    try {
        const storeId = req.user?.storeId || req.storeId;
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }
        const message = await Message_1.Message.findOneAndUpdate({ _id: id, storeId }, { isRead: true }, { new: true });
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, data: message });
    }
    catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// Create message
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const storeId = req.user?.storeId || req.storeId;
        const tenantId = req.user?.tenantId;
        const senderId = req.user?._id;
        const senderName = req.user?.name || req.user?.email || 'Unknown';
        const { content, relatedModule, relatedRecordId } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }
        const newMessage = new Message_1.Message({
            tenantId,
            storeId,
            sender: senderName,
            senderId,
            content,
            relatedModule,
            relatedRecordId,
            isRead: false
        });
        await newMessage.save();
        res.status(201).json({ success: true, data: newMessage });
    }
    catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map