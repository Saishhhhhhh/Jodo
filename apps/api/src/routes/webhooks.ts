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

// Meta Webhook Receiving Messages (Instagram DMs & Facebook Messenger)
router.post('/meta', async (req, res, next) => {
  try {
    const body = req.body;

    if (body.object === 'instagram' || body.object === 'page') {
      let store = await Store.findOne();
      if (!store) {
        const tenant = await Tenant.findOne();
        if (tenant) {
          store = await Store.create({
            tenantId: tenant._id,
            name: 'Jodo Flagship Store',
            slug: 'default-store',
            domain: 'jodo.store',
          });
        }
      }

      if (!store) {
        console.error('Meta webhook: No store or tenant found to link incoming lead');
        return res.status(200).send('EVENT_RECEIVED');
      }

      for (const entry of (body.entry || [])) {
        if (!entry.messaging) continue;

        for (const webhook_event of entry.messaging) {
          // Ignore echo events (messages sent by the page/account itself)
          if (webhook_event.message?.is_echo) continue;

          const senderId = webhook_event.sender?.id;
          const message =
            webhook_event.message?.text ||
            (webhook_event.message?.attachments ? '[User sent photo/attachment]' : webhook_event.postback?.title || '');
          const source = body.object === 'instagram' ? 'Instagram' : 'Facebook';

          if (message && senderId) {
            // AI intent detection using rotating API keys
            let isLead = true;
            let interestLevel: 'High' | 'Medium' | 'Low' = 'Medium';
            let productRequirement = '';

            try {
              const detected = await AiContentService.detectLeadIntent(message, source);
              isLead = detected.isLead;
              interestLevel = detected.interestLevel;
              productRequirement = detected.productRequirement;
            } catch (aiErr) {
              console.error('AI Intent analysis fallback triggered:', aiErr);
              productRequirement = message.slice(0, 100);
            }

            if (isLead) {
              const displaySender = senderId.length > 8 ? senderId.slice(-6) : senderId;
              await Lead.create({
                tenantId: store.tenantId,
                storeId: store._id,
                name: `${source} User (${displaySender})`,
                source: source,
                status: 'New',
                interestLevel: interestLevel,
                followUpPriority: interestLevel === 'High' ? 'High' : 'Medium',
                productRequirement: productRequirement,
                notes: `Original Message: "${message}"\nSender Platform ID: ${senderId}`,
              });
              console.log(`[Meta Webhook] Successfully captured ${source} lead from sender ${senderId}`);
            }
          }
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.sendStatus(404);
  } catch (error) {
    console.error('Meta webhook error:', error);
    // Return 200 to acknowledge Meta delivery so the webhook isn't disabled by Meta
    return res.status(200).send('EVENT_RECEIVED');
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
