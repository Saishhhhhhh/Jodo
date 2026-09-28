import express from 'express';
import { requireAuth } from '../middleware/auth';
import { Message } from '../models/Message';
import mongoose from 'mongoose';

const router = express.Router();

// Get messages
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const storeId = req.user?.storeId || req.storeId;
    const { module, recordId, isRead } = req.query;

    let query: any = { storeId };

    if (module) query.relatedModule = module;
    if (recordId && mongoose.Types.ObjectId.isValid(recordId as string)) {
      query.relatedRecordId = recordId;
    }
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const messages = await Message.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Mark as read
router.patch('/:id/read', requireAuth, async (req: any, res) => {
  try {
    const storeId = req.user?.storeId || req.storeId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const message = await Message.findOneAndUpdate(
      { _id: id, storeId },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Create message
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const storeId = req.user?.storeId || req.storeId;
    const tenantId = req.user?.tenantId;
    const senderId = req.user?._id;
    const senderName = req.user?.name || req.user?.email || 'Unknown';
    
    const { content, relatedModule, relatedRecordId } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const newMessage = new Message({
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
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
