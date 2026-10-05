"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const BlogPost_1 = require("../models/BlogPost");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status && req.query.status !== 'All') {
            filter.status = req.query.status;
        }
        if (req.query.category && req.query.category !== 'All' && req.query.category !== 'All Stories') {
            filter.category = req.query.category;
        }
        if (req.query.q && typeof req.query.q === 'string' && req.query.q.trim()) {
            filter.$or = [
                { title: { $regex: req.query.q.trim(), $options: 'i' } },
                { excerpt: { $regex: req.query.q.trim(), $options: 'i' } },
                { content: { $regex: req.query.q.trim(), $options: 'i' } },
                { author: { $regex: req.query.q.trim(), $options: 'i' } },
            ];
        }
        const blogs = await BlogPost_1.BlogPost.find(filter).sort({ featured: -1, publishedAt: -1, createdAt: -1 });
        (0, response_1.sendSuccess)(res, blogs);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const blog = await BlogPost_1.BlogPost.findById(req.params.id);
        if (!blog)
            return (0, response_1.sendError)(res, 'Blog post not found', 404);
        (0, response_1.sendSuccess)(res, blog);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const { title, slug, excerpt, content, category, author, authorRole, coverImage, readTime, featured, status, tags } = req.body;
        if (!title || !excerpt || !content) {
            return (0, response_1.sendError)(res, 'Title, Excerpt and Content are required', 400);
        }
        // Auto-generate slug if not provided
        const finalSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existing = await BlogPost_1.BlogPost.findOne({ slug: finalSlug });
        if (existing) {
            return (0, response_1.sendError)(res, 'A blog post with this slug already exists', 400);
        }
        const blog = new BlogPost_1.BlogPost({
            title: title.trim(),
            slug: finalSlug,
            excerpt: excerpt.trim(),
            content: content.trim(),
            category: category ? category.trim() : 'Craft & Material',
            author: author ? author.trim() : 'Jodo Editorial',
            authorRole: authorRole ? authorRole.trim() : 'Design & Craft Studio',
            coverImage: coverImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
            readTime: readTime ? readTime.trim() : '5 min read',
            featured: Boolean(featured),
            status: status || 'published',
            tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : []),
            publishedAt: new Date(),
        });
        await blog.save();
        (0, response_1.sendSuccess)(res, blog, 'Blog post created successfully', 201);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (updateData.slug) {
            updateData.slug = updateData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const existing = await BlogPost_1.BlogPost.findOne({ slug: updateData.slug, _id: { $ne: req.params.id } });
            if (existing) {
                return (0, response_1.sendError)(res, 'A blog post with this slug already exists', 400);
            }
        }
        if (updateData.tags !== undefined) {
            updateData.tags = Array.isArray(updateData.tags)
                ? updateData.tags
                : (typeof updateData.tags === 'string'
                    ? updateData.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : []);
        }
        if (updateData.featured !== undefined) {
            updateData.featured = Boolean(updateData.featured);
        }
        const blog = await BlogPost_1.BlogPost.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!blog)
            return (0, response_1.sendError)(res, 'Blog post not found', 404);
        (0, response_1.sendSuccess)(res, blog, 'Blog post updated successfully');
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/toggle-featured', async (req, res, next) => {
    try {
        const blog = await BlogPost_1.BlogPost.findById(req.params.id);
        if (!blog)
            return (0, response_1.sendError)(res, 'Blog post not found', 404);
        blog.featured = !blog.featured;
        await blog.save();
        (0, response_1.sendSuccess)(res, blog, `Blog post is now ${blog.featured ? 'featured' : 'unfeatured'}`);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/toggle-status', async (req, res, next) => {
    try {
        const blog = await BlogPost_1.BlogPost.findById(req.params.id);
        if (!blog)
            return (0, response_1.sendError)(res, 'Blog post not found', 404);
        blog.status = blog.status === 'published' ? 'draft' : 'published';
        await blog.save();
        (0, response_1.sendSuccess)(res, blog, `Blog status updated to ${blog.status}`);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id', async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (updateData.slug) {
            updateData.slug = updateData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const existing = await BlogPost_1.BlogPost.findOne({ slug: updateData.slug, _id: { $ne: req.params.id } });
            if (existing) {
                return (0, response_1.sendError)(res, 'A blog post with this slug already exists', 400);
            }
        }
        if (updateData.tags !== undefined) {
            updateData.tags = Array.isArray(updateData.tags)
                ? updateData.tags
                : (typeof updateData.tags === 'string'
                    ? updateData.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : []);
        }
        const blog = await BlogPost_1.BlogPost.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!blog)
            return (0, response_1.sendError)(res, 'Blog post not found', 404);
        (0, response_1.sendSuccess)(res, blog, 'Blog post updated successfully');
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const blog = await BlogPost_1.BlogPost.findByIdAndDelete(req.params.id);
        if (!blog)
            return (0, response_1.sendError)(res, 'Blog post not found', 404);
        (0, response_1.sendSuccess)(res, null, 'Blog post deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=blogs.js.map