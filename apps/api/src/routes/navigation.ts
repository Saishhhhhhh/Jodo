import { Router } from 'express';
import { Navigation } from '../models/Navigation';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const menus = await Navigation.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ createdAt: -1 });
    sendSuccess(res, menus);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, handle, items } = req.body;
    
    // Check if handle already exists for this store
    const existing = await Navigation.findOne({
      storeId: req.auth!.storeId,
      handle,
    });
    
    if (existing) {
      return sendError(res, 'A menu with this handle already exists', 400);
    }

    const menu = new Navigation({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      title,
      handle,
      items: items || [],
    });

    await menu.save();
    sendSuccess(res, menu, 'Menu created successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const menu = await Navigation.findOne({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });
    if (!menu) return sendError(res, 'Menu not found', 404);
    sendSuccess(res, menu);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title, handle, items } = req.body;
    
    // Check handle collision if handle is changed
    if (handle) {
      const existing = await Navigation.findOne({
        storeId: req.auth!.storeId,
        handle,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return sendError(res, 'A menu with this handle already exists', 400);
      }
    }

    const menu = await Navigation.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.auth!.tenantId,
        storeId: req.auth!.storeId,
      },
      { $set: { title, handle, items } },
      { new: true, runValidators: true }
    );

    if (!menu) return sendError(res, 'Menu not found', 404);
    sendSuccess(res, menu, 'Menu updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const menu = await Navigation.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });
    if (!menu) return sendError(res, 'Menu not found', 404);
    sendSuccess(res, null, 'Menu deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
