import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { InventoryItem } from '../models/InventoryItem';
import { sendSuccess, sendError } from '../utils/response';

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

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { available, committed } = req.body;

    const item = await InventoryItem.findOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!item) {
      return sendError(res, 'Inventory item not found', 404);
    }

    if (available !== undefined) item.available = parseInt(available, 10);
    if (committed !== undefined) item.committed = parseInt(committed, 10);

    // Recalculate totals
    item.onHand = item.available + item.committed;

    // Transition stock status
    if (item.available === 0) {
      item.status = 'out_of_stock';
    } else if (item.available < 15) {
      item.status = 'low_stock';
    } else {
      item.status = 'in_stock';
    }

    await item.save();

    sendSuccess(res, item, 'Inventory updated successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
