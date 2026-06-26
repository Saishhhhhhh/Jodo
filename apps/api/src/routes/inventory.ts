import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { InventoryItem } from '../models/InventoryItem';
import { successResponse } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const inventory = await InventoryItem.find({
      tenantId: req.user!.tenantId,
      storeId: req.user!.storeId,
    }).sort({ createdAt: -1 });

    res.json(successResponse(inventory));
  } catch (error) {
    next(error);
  }
});

export default router;
