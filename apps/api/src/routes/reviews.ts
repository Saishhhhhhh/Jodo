import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Review } from '../models/Review';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/admin/reviews
 * List all reviews for the store (populated with product info)
 */
router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    })
      .populate('productId', 'title sku imageUrl category vendor')
      .sort({ createdAt: -1 });

    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/reviews
 * Create a new review manually (for storefront / seed imports)
 */
router.post('/', async (req, res, next) => {
  try {
    const { productId, rating, authorName, authorEmail, title, body, status } = req.body;

    if (!productId || !rating || !authorName || !authorEmail || !body) {
      return sendError(res, 'Missing required review fields', 400);
    }

    const review = await Review.create({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      productId,
      rating: parseInt(rating, 10),
      authorName,
      authorEmail,
      title,
      body,
      status: status || 'pending',
    });

    sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/reviews/:id
 * Update status or review details
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, title, body, rating } = req.body;

    const review = await Review.findOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    if (status) review.status = status;
    if (title !== undefined) review.title = title;
    if (body !== undefined) review.body = body;
    if (rating !== undefined) review.rating = parseInt(rating, 10);

    await review.save();

    sendSuccess(res, review, 'Review updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/reviews/:id
 * Delete/reject a review
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Review.deleteOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (result.deletedCount === 0) {
      return sendError(res, 'Review not found or access denied', 404);
    }

    sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
