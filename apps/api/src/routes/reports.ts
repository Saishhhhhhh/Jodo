import { Router, Request, Response } from 'express';
import { requireAuth, requireTenant } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { Lead } from '../models/Lead';
import { Product } from '../models/Product';
import { InteraktService } from '../services/interakt';
import { Tenant } from '../models/Tenant';
import { AiContentService } from '../services/aiContentService';

const router = Router();

// Apply auth to all reports routes
router.use(requireAuth, requireTenant);

/**
 * Helper to calculate start and end of dates
 */
const getStartOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfWeek = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7; 
  if (day !== 1) d.setHours(-24 * (day - 1)); 
  return d;
};

/**
 * GET /api/admin/reports/digest
 * Generates Daily and Weekly summaries
 */
router.get('/digest', async (req: Request, res: Response, next) => {
  try {
    const tenantId = req.auth!.tenantId;
    const storeId = req.auth!.storeId;
    
    const startOfToday = getStartOfDay();
    const startOfWeek = getStartOfWeek();

    // 1. Sales & Orders
    const orders = await Order.find({ tenantId, storeId });
    
    const dailyOrders = orders.filter(o => new Date(o.createdAt) >= startOfToday);
    const weeklyOrders = orders.filter(o => new Date(o.createdAt) >= startOfWeek);
    
    const dailyRevenue = dailyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const weeklyRevenue = weeklyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    // 2. Leads & Follow-ups
    const leads = await Lead.find({ tenantId, storeId });
    
    const dailyLeads = leads.filter(l => new Date(l.createdAt) >= startOfToday);
    const weeklyLeads = leads.filter(l => new Date(l.createdAt) >= startOfWeek);
    
    const pendingFollowUps = leads.filter(l => 
      l.followUpPriority === 'High' && 
      l.status !== 'Won' && 
      l.status !== 'Lost'
    ).length;

    // 3. Inventory
    const lowStockCount = await Product.countDocuments({
      tenantId,
      storeId,
      status: 'active',
      inventoryQuantity: { $lte: 15 } // Using 15 as standard fallback threshold
    });

    // 4. Quotations & Support Cases (Stubbed for now as they are not implemented in core schema yet)
    const quotations = { daily: 0, weekly: 0, pending: 0 };
    const supportCases = { daily: 0, weekly: 0, open: 0 };

    const payload = {
      daily: {
        revenue: dailyRevenue,
        orders: dailyOrders.length,
        newLeads: dailyLeads.length,
        quotationsSent: quotations.daily,
        supportCasesOpened: supportCases.daily
      },
      weekly: {
        revenue: weeklyRevenue,
        orders: weeklyOrders.length,
        newLeads: weeklyLeads.length,
        quotationsSent: quotations.weekly,
        supportCasesOpened: supportCases.weekly
      },
      current: {
        pendingFollowUps,
        lowStockItems: lowStockCount,
        openSupportCases: supportCases.open,
        pendingQuotations: quotations.pending
      }
    };

    sendSuccess(res, payload);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/reports/generate-ai-summary
 * Generates an AI summary on demand for the current metrics
 */
router.post('/generate-ai-summary', async (req: Request, res: Response, next) => {
  try {
    const { payload } = req.body;
    if (!payload) {
      return sendError(res, 'Report data payload is required.', 400);
    }

    const aiResult = await AiContentService.generate({
      contentType: 'report_digest',
      reportData: payload,
      tone: 'Professional and Encouraging',
      length: 'Short'
    });

    sendSuccess(res, aiResult.content);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/reports/send-digest
 * Triggers a WhatsApp message with the daily summary
 */
router.post('/send-digest', async (req: Request, res: Response, next) => {
  try {
    const tenantId = req.auth!.tenantId;
    const storeId = req.auth!.storeId;
    
    const tenant: any = await Tenant.findById(tenantId);
    if (!tenant?.settings?.interaktApiKey) {
      return sendError(res, 'Interakt is not configured for this tenant.', 400);
    }

    const { targetPhone } = req.body;
    if (!targetPhone) {
      return sendError(res, 'Target phone number is required to send digest.', 400);
    }

    const startOfToday = getStartOfDay();
    
    // Quick calculate daily metrics
    const dailyOrders = await Order.find({ tenantId, storeId, createdAt: { $gte: startOfToday } });
    const dailyRevenue = dailyOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    
    const dailyLeads = await Lead.countDocuments({ tenantId, storeId, createdAt: { $gte: startOfToday } });
    const pendingFollowUps = await Lead.countDocuments({ tenantId, storeId, followUpPriority: 'High', status: { $nin: ['Won', 'Lost'] } });
    
    const lowStockCount = await Product.countDocuments({ tenantId, storeId, status: 'active', inventoryQuantity: { $lte: 15 } });

    // In production, we'd use a template: await InteraktService.sendTemplateMessage(...)
    await InteraktService.sendTemplateMessage(
      tenant.settings.interaktApiKey,
      targetPhone,
      'daily_digest_template',
      'en',
      [String(dailyRevenue), String(dailyOrders.length), String(dailyLeads), String(pendingFollowUps), String(lowStockCount)]
    );

    sendSuccess(res, null, 'Digest sent successfully via WhatsApp event.');
  } catch (err) {
    next(err);
  }
});

export default router;
