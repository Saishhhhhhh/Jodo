"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogPost = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blogPostSchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
blogPostSchema.index({ status: 1, publishedAt: -1 });
exports.BlogPost = mongoose_1.default.models.BlogPost || mongoose_1.default.model('BlogPost', blogPostSchema);
//# sourceMappingURL=BlogPost.js.map