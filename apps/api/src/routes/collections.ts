import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Collection } from '../models/Collection';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

// Helper to generate slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

/**
 * GET /api/admin/collections
 * List all collections for current store
 */
router.get('/', async (req, res, next) => {
  try {
    const collections = await Collection.find({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    })
      .populate('products')
      .sort({ createdAt: -1 });

    sendSuccess(res, collections);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/collections
 * Create a new collection
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, imageUrl, type, products, status } = req.body;

    if (!title) {
      return sendError(res, 'Title is required', 400);
    }

    const slug = slugify(title);

    // Check if slug is unique per store
    const existing = await Collection.findOne({
      storeId: req.auth!.storeId,
      slug,
    });

    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const collection = await Collection.create({
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
      title,
      slug: finalSlug,
      description,
      imageUrl,
      type: type || 'manual',
      products: products || [],
      status: status || 'draft',
    });

    sendSuccess(res, collection, 'Collection created successfully', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/collections/:id
 * Update an existing collection
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { title, description, imageUrl, type, products, status } = req.body;
    const { id } = req.params;

    const collection = await Collection.findOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (!collection) {
      return sendError(res, 'Collection not found', 404);
    }

    if (title) {
      collection.title = title;
      // Regenerate slug if title changes
      const slug = slugify(title);
      const existing = await Collection.findOne({
        _id: { $ne: id },
        storeId: req.auth!.storeId,
        slug,
      });
      collection.slug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
    }

    if (description !== undefined) collection.description = description;
    if (imageUrl !== undefined) collection.imageUrl = imageUrl;
    if (type) collection.type = type;
    if (products) collection.products = products;
    if (status) collection.status = status;

    await collection.save();

    sendSuccess(res, collection, 'Collection updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/collections/:id
 * Delete a collection
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Collection.deleteOne({
      _id: id,
      tenantId: req.auth!.tenantId,
      storeId: req.auth!.storeId,
    });

    if (result.deletedCount === 0) {
      return sendError(res, 'Collection not found or access denied', 404);
    }

    sendSuccess(res, null, 'Collection deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
