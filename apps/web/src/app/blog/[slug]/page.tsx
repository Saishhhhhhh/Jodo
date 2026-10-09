'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorRole?: string;
  coverImage: string;
  readTime: string;
  publishedAt: string;
  tags?: string[];
}

// Inline markdown helper for bold and italic text
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-[#1C1A17]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-[#1C1A17]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/storefront/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setPost(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center text-[#8E867E] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
        <p className="text-sm font-medium">Opening story from The Jodo Journal...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center px-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-[#1C1A17] mb-2">Story Not Found</h2>
        <p className="text-[#666666] mb-6 max-w-md">
          The article you are looking for doesn’t exist or has been archived.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1A17] text-white rounded-full text-sm font-semibold hover:bg-terracotta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to The Journal</span>
        </Link>
      </div>
    );
  }

  // Parse markdown headings / paragraphs / lists
  const paragraphs = post.content ? post.content.split('\n\n').filter(Boolean) : [];

  return (
    <article className="min-h-screen bg-white font-sans text-[#1C1A17] pb-16">
      {/* ── TOP BREADCRUMB / ACTION BAR ── */}
      <div className="px-4 lg:px-6 py-3 border-b border-[#ECE6DE]">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#57524C] hover:text-terracotta transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>The Jodo Journal</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#57524C] hover:text-[#1C1A17] bg-[#FAF7F2] px-3.5 py-1.5 rounded-full border border-[#ECE6DE] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Story'}</span>
          </button>
        </div>
      </div>

      {/* ── ARTICLE HEADER ── */}
      <header className="max-w-[960px] mx-auto px-5 sm:px-8 pt-10 md:pt-14 pb-8">
        <div className="flex items-center gap-3 text-xs text-[#8E867E] font-medium mb-4 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-terracotta/10 text-terracotta font-bold uppercase tracking-wider">
            {post.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTime}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-[#1C1A17] leading-[1.14] tracking-tight mb-6">
          {post.title}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-[#57524C] leading-relaxed font-normal mb-8 max-w-3xl">
          {post.excerpt}
        </p>

        {/* Author Details */}
        <div className="flex items-center gap-4 py-4 border-y border-[#ECE6DE]">
          <div className="w-11 h-11 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-center text-terracotta font-bold text-base shadow-2xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#1C1A17]">{post.author}</div>
            <div className="text-xs text-[#8E867E]">
              {post.authorRole || 'Furniture Designer & Woodcraft Researcher'}
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO IMAGE ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative aspect-[16/9] w-full rounded-[24px] md:rounded-[36px] overflow-hidden shadow-lg border border-[#ECE6DE]">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* ── ARTICLE BODY CONTENT ── */}
      <div className="max-w-[780px] mx-auto px-5 sm:px-8 pb-16">
        <div className="space-y-6 text-base sm:text-lg leading-[1.8] text-[#3D3A36]">
          {paragraphs.map((p, i) => {
            if (p.startsWith('### ')) {
              return (
                <h3
                  key={i}
                  className="font-heading text-xl sm:text-2xl font-bold text-[#1C1A17] pt-6 pb-1 tracking-tight"
                >
                  {p.replace('### ', '')}
                </h3>
              );
            }
            if (p.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1A17] pt-8 pb-2 tracking-tight"
                >
                  {p.replace('## ', '')}
                </h2>
              );
            }
            if (p.startsWith('> ')) {
              return (
                <blockquote
                  key={i}
                  className="pl-5 border-l-4 border-terracotta my-6 italic text-lg sm:text-xl text-[#1C1A17] bg-[#FAF7F2] py-4 px-5 rounded-r-[16px]"
                  style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}
                >
                  {renderInlineMarkdown(p.replace('> ', ''))}
                </blockquote>
              );
            }
            if (p.startsWith('- ') || p.startsWith('* ')) {
              const listItems = p.split('\n').filter(Boolean);
              return (
                <ul key={i} className="list-disc pl-6 space-y-2 text-[#3D3A36]">
                  {listItems.map((item, idx) => (
                    <li key={idx}>
                      {renderInlineMarkdown(item.replace(/^[-*]\s*/, ''))}
                    </li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\.\s/.test(p)) {
              const listItems = p.split('\n').filter(Boolean);
              return (
                <ol key={i} className="list-decimal pl-6 space-y-2 text-[#3D3A36]">
                  {listItems.map((item, idx) => (
                    <li key={idx}>
                      {renderInlineMarkdown(item.replace(/^\d+\.\s*/, ''))}
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <p
                key={i}
                className={
                  i === 0
                    ? 'first-letter:text-5xl first-letter:font-bold first-letter:text-terracotta first-letter:float-left first-letter:mr-3 first-letter:font-heading leading-relaxed'
                    : 'leading-relaxed'
                }
              >
                {renderInlineMarkdown(p)}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#ECE6DE] flex items-center flex-wrap gap-2">
            <span className="text-xs font-semibold text-[#8E867E] uppercase tracking-wider mr-2">
              Topic Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1 bg-[#FAF7F2] text-xs font-semibold text-[#57524C] rounded-full border border-[#ECE6DE]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── FOOTER JODO CALLOUT ── */}
        <div className="mt-16 bg-[#1C1A17] text-white rounded-[28px] md:rounded-[36px] p-8 md:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-terracotta font-bold text-xs tracking-widest uppercase mb-1">
                The Joy of Together
              </p>
              <h4 className="font-heading text-xl sm:text-2xl font-bold text-white mb-2">
                Explore JODO Tool-Free Furniture
              </h4>
              <p className="text-sm text-white/80 max-w-md font-light leading-relaxed">
                Clicks together without screws, tools, or a carpenter. Designed for effortless living and enduring comfort.
              </p>
            </div>

            {/* JODO Signature Button */}
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-3 bg-terracotta text-white rounded-full px-6 py-3.5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 justify-center whitespace-nowrap shrink-0"
            >
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              <span className="relative z-10 font-bold text-sm group-hover:text-[#1C1A17] transition-colors">
                Browse Collection
              </span>
              <span className="relative z-10 flex items-center justify-center bg-white rounded-full w-7 h-7 group-hover:bg-[#1C1A17] transition-colors duration-500">
                <ArrowUpRight className="w-3.5 h-3.5 text-terracotta group-hover:text-white transition-colors duration-500" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
