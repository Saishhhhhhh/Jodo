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
export declare const BlogPost: mongoose.Model<any, {}, {}, {}, any, any>;
