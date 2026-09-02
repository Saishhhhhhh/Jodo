import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Campaign } from '../models/Campaign';
import { sendSuccess, sendCreated } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, campaigns);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, type, status, budget, startDate, endDate } = req.body;

    const campaign = await Campaign.create({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      name,
      type,
      status: status || 'draft',
      budget,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
    });

    sendCreated(res, campaign);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, type, status, budget, startDate, endDate } = req.body;
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, storeId: req.auth!.storeId },
      { 
        $set: { 
          ...(name && { name }),
          ...(type && { type }),
          ...(status && { status }),
          ...(budget !== undefined && { budget }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : undefined })
        } 
      },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: 'Campaign not found', code: 'NOT_FOUND' }
      });
    }

    sendSuccess(res, campaign);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      storeId: req.auth!.storeId,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: 'Campaign not found', code: 'NOT_FOUND' }
      });
    }

    sendSuccess(res, { message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
