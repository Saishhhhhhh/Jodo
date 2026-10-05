import { Router } from 'express';
import { BlogPost } from '../models/BlogPost';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const blogs = await BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 });
    sendSuccess(res, blogs);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) return sendError(res, 'Blog post not found', 404);
    sendSuccess(res, blog);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, category, author, authorRole, coverImage, readTime, featured, status, tags } = req.body;
    if (!title || !excerpt || !content) {
      return sendError(res, 'Title, Excerpt and Content are required', 400);
    }

    // Auto-generate slug if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await BlogPost.findOne({ slug: finalSlug });
    if (existing) {
      return sendError(res, 'A blog post with this slug already exists', 400);
    }

    const blog = new BlogPost({
      title,
      slug: finalSlug,
      excerpt,
      content,
      category: category || 'Craft & Material',
      author: author || 'Jodo Editorial',
      authorRole: authorRole || 'Design & Craft Studio',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      readTime: readTime || '5 min read',
      featured: Boolean(featured),
      status: status || 'published',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : []),
      publishedAt: new Date(),
    });

    await blog.save();
    sendSuccess(res, blog, 'Blog post created successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const blog = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!blog) return sendError(res, 'Blog post not found', 404);
    sendSuccess(res, blog, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const blog = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blog) return sendError(res, 'Blog post not found', 404);
    sendSuccess(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
