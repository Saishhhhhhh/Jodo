"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Collection_1 = require("../models/Collection");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Helper to generate slug
const slugify = (text) => {
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
        const collections = await Collection_1.Collection.find({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        })
            .populate('products')
            .sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, collections);
    }
    catch (error) {
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
            return (0, response_1.sendError)(res, 'Title is required', 400);
        }
        const slug = slugify(title);
        // Check if slug is unique per store
        const existing = await Collection_1.Collection.findOne({
            storeId: req.auth.storeId,
            slug,
        });
        const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
        const collection = await Collection_1.Collection.create({
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
            title,
            slug: finalSlug,
            description,
            imageUrl,
            type: type || 'manual',
            products: products || [],
            status: status || 'draft',
        });
        (0, response_1.sendSuccess)(res, collection, 'Collection created successfully', 201);
    }
    catch (error) {
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
        const collection = await Collection_1.Collection.findOne({
            _id: id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (!collection) {
            return (0, response_1.sendError)(res, 'Collection not found', 404);
        }
        if (title) {
            collection.title = title;
            // Regenerate slug if title changes
            const slug = slugify(title);
            const existing = await Collection_1.Collection.findOne({
                _id: { $ne: id },
                storeId: req.auth.storeId,
                slug,
            });
            collection.slug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
        }
        if (description !== undefined)
            collection.description = description;
        if (imageUrl !== undefined)
            collection.imageUrl = imageUrl;
        if (type)
            collection.type = type;
        if (products)
            collection.products = products;
        if (status)
            collection.status = status;
        await collection.save();
        (0, response_1.sendSuccess)(res, collection, 'Collection updated successfully');
    }
    catch (error) {
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
        const result = await Collection_1.Collection.deleteOne({
            _id: id,
            tenantId: req.auth.tenantId,
            storeId: req.auth.storeId,
        });
        if (result.deletedCount === 0) {
            return (0, response_1.sendError)(res, 'Collection not found or access denied', 404);
        }
        (0, response_1.sendSuccess)(res, null, 'Collection deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=collections.js.map