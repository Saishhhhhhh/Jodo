import { Router } from 'express';
import { Banner } from '../models/Banner';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const banners = await Banner.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    }).sort({ order: 1, createdAt: -1 });
    sendSuccess(res, banners);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const banner = new Banner({
      ...req.body,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });
    await banner.save();
    sendSuccess(res, banner, 'Banner created successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const banner = await Banner.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.auth!.tenantId,
        storeId: req.auth!.storeId,
      },
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) return sendError(res, 'Banner not found', 404);
    sendSuccess(res, banner, 'Banner updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const banner = await Banner.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });
    if (!banner) return sendError(res, 'Banner not found', 404);
    sendSuccess(res, null, 'Banner deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
