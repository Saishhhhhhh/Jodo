import { Router } from 'express';
import { Store } from '../models/Store';
import { Lead } from '../models/Lead';
import { Tenant } from '../models/Tenant';
import { sendSuccess, sendError } from '../utils/response';
import { AiContentService } from '../services/aiContentService';

const router = Router();

// Meta Webhook Verification
router.get('/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token) {
    console.log('WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Meta Webhook Receiving Messages (Instagram DMs)
router.post('/meta', async (req, res, next) => {
  try {
    const body = req.body;

    if (body.object === 'instagram') {
      const store = await Store.findOne();
      if (!store) return sendError(res, 'Store not found', 404);

      for (const entry of body.entry) {
        if (!entry.messaging) continue;

        for (const webhook_event of entry.messaging) {
          const senderId = webhook_event.sender.id;
          const message = webhook_event.message?.text;

          if (message) {
            // AI intent detection
            const aiPrompt = `Analyze the following message from an Instagram user and determine if they show purchasing intent for furniture/home decor. 
            Message: "${message}"
            Reply with a JSON object { "isLead": true/false, "interestLevel": "High" | "Medium" | "Low", "productRequirement": "brief summary of what they want if applicable" }`;
            
            let isLead = true;
            let interestLevel: 'High' | 'Medium' | 'Low' = 'Medium';
            let productRequirement = '';

            try {
              const { env } = require('../config/env');
              const { default: OpenAI } = require('openai');
              const aiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY_1;
              
              if (aiKey) {
                const openai = new OpenAI({ apiKey: aiKey });
                const completion = await openai.chat.completions.create({
                  model: env.OPENAI_MODEL || 'gpt-4o-mini',
                  messages: [
                    { role: 'system', content: 'You are an intent detection bot for Jodo Furniture. You return JSON.' },
                    { role: 'user', content: aiPrompt }
                  ],
                  temperature: 0.2,
                  response_format: { type: 'json_object' }
                });
                
                const raw = completion.choices[0]?.message?.content || '{}';
                const parsed = JSON.parse(raw);
                isLead = parsed.isLead ?? true;
                interestLevel = parsed.interestLevel || 'Medium';
                productRequirement = parsed.productRequirement || '';
              }
            } catch (aiErr) {
              console.error('AI Intent analysis failed, defaulting to lead capture', aiErr);
            }

            if (isLead) {
              await Lead.create({
                tenantId: store.tenantId,
                storeId: store._id,
                name: `IG User (${senderId})`,
                source: 'Instagram',
                status: 'New',
                interestLevel: interestLevel,
                followUpPriority: interestLevel === 'High' ? 'High' : 'Medium',
                productRequirement: productRequirement,
                notes: `Original Message: "${message}"`,
              });
            }
          }
        }
      }
      return sendSuccess(res, null, 'EVENT_RECEIVED');
    }

    return res.sendStatus(404);
  } catch (error) {
    console.error('Meta webhook error:', error);
    next(error);
  }
});

/**
 * POST /api/webhooks/leads
 * Universal webhook for incoming leads from Website, Interakt (WhatsApp), etc.
 */
router.post('/leads', async (req, res, next) => {
  try {
    let tenantId = req.query.tenantId as string;
    let storeId = req.query.storeId as string;

    if (!tenantId || !storeId) {
      const tenant = await Tenant.findOne();
      const store = await Store.findOne();
      if (!tenant || !store) return sendError(res, 'System not initialized', 500);
      tenantId = tenant._id.toString();
      storeId = store._id.toString();
    }

    const payload = req.body;
    let leadData: any = {
      tenantId,
      storeId,
      status: 'New',
      followUpPriority: 'Medium',
      interestLevel: 'Medium',
    };

    if (payload.type === 'message' && payload.data && payload.data.message) {
      const waData = payload.data.message;
      const customer = waData.customer;
      
      leadData.source = 'WhatsApp';
      leadData.name = customer?.traits?.name || customer?.phone_number || 'Unknown WhatsApp User';
      leadData.phone = customer?.phone_number;
      leadData.notes = `[Auto-captured from WhatsApp]\nInitial Message: ${waData.message?.text || 'Media Message'}`;
      
    } else {
      leadData.source = payload.source || 'Website';
      leadData.name = payload.name;
      leadData.email = payload.email;
      leadData.phone = payload.phone;
      leadData.productRequirement = payload.productRequirement;
      leadData.budget = payload.budget;
      leadData.location = payload.location;
      leadData.notes = payload.message ? `[Auto-captured from Website]\nMessage: ${payload.message}` : '';

      if (!leadData.name) {
        return sendError(res, 'Name is required for generic lead capture', 400);
      }
    }

    const lead = new Lead(leadData);
    await lead.save();

    sendSuccess(res, null, 'Lead captured successfully', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
