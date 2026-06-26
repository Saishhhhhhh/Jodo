import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { InventoryItem } from '../models/InventoryItem';
import { sendSuccess } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const inventory = await InventoryItem.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });

    sendSuccess(res, inventory);
  } catch (error) {
    next(error);
  }
});

export default router;
