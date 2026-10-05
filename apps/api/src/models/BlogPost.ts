import mongoose from 'mongoose';

export interface IBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole?: string;
  coverImage: string;
  readTime: string;
  featured: boolean;
  status: 'published' | 'draft';
  publishedAt: Date;
  tags?: string[];
}

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, default: 'Jodo Editorial' },
    authorRole: { type: String, default: 'Design & Craft Studio' },
    coverImage: { type: String, required: true },
    readTime: { type: String, default: '5 min read' },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    publishedAt: { type: Date, default: Date.now },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

blogPostSchema.index({ status: 1, publishedAt: -1 });

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema);
