import { Router, Request, Response } from 'express';
import { requireAuth, requireTenant } from '../middleware/auth';
import { Store } from '../models/Store';
import { sendSuccess, sendError } from '../utils/response';
import mongoose from 'mongoose';

const router = Router();

router.use(requireAuth, requireTenant);

/**
 * GET /api/admin/store
 * Get the current tenant's store details
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    
    const store = await Store.findOne({ tenantId }).lean();
    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    sendSuccess(res, store);
  } catch (error) {
    console.error('Error fetching store:', error);
    sendError(res, 'Failed to fetch store details');
  }
});

/**
 * PUT /api/admin/store
 * Update the current tenant's store details
 */
router.put('/', async (req: Request, res: Response) => {
  try {
    const tenantId = new mongoose.Types.ObjectId(req.auth!.tenantId);
    
    // Extract standard fields
    const { 
      name, 
      defaultCurrency, 
      defaultCountry, 
      timezone, 
      settings 
    } = req.body;

    const store = await Store.findOne({ tenantId });
    if (!store) {
      return sendError(res, 'Store not found', 404);
    }

    // Update standard fields if provided
    if (name) store.name = name;
    if (defaultCurrency) store.defaultCurrency = defaultCurrency;
    if (defaultCountry) store.defaultCountry = defaultCountry;
    if (timezone) store.timezone = timezone;

    // Merge settings if provided
    if (settings) {
      store.settings = { ...(store.settings as Record<string, unknown>), ...settings };
      // Mongoose mixed types need to be marked as modified
      store.markModified('settings');
    }

    await store.save();

    sendSuccess(res, store, 'Store details updated successfully');
  } catch (error) {
    console.error('Error updating store:', error);
    sendError(res, 'Failed to update store details');
  }
});

export default router;
