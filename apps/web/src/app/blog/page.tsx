'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Search,
  BookOpen,
  CheckCircle2,
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
  featured?: boolean;
  publishedAt: string;
  tags?: string[];
}

const FALLBACK_BLOGS: BlogPost[] = [
  {
    _id: 'b-1',
    slug: 'art-of-slow-furniture',
    title: 'The Art of Slow Furniture: Why Intentional Craftsmanship Matters',
    excerpt:
      'In an era of disposable decor, we explore why sustainably harvested timber, traditional mortise joints, and thoughtful proportion create heirlooms that outlast fleeting trends.',
    content: '',
    category: 'Craft & Material',
    author: 'Aarav Mehta',
    authorRole: 'Head of Furniture Design',
    coverImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 min read',
    featured: true,
    publishedAt: '2026-10-01',
    tags: ['Craftsmanship', 'Solid Wood', 'Slow Living'],
  },
  {
    _id: 'b-2',
    slug: 'warm-minimalism-guide',
    title: 'How to Master Warm Minimalism in Contemporary Indian Homes',
    excerpt:
      'Combining organic textures, linen draping, earthy terracotta accents, and soft architectural curves to evoke peaceful, breathing spaces.',
    content: '',
    category: 'Design & Interiors',
    author: 'Sunaina Rao',
    authorRole: 'Interior Stylist',
    coverImage:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    featured: false,
    publishedAt: '2026-09-25',
    tags: ['Minimalism', 'Interior Styling', 'Color Palette'],
  },
  {
    _id: 'b-3',
    slug: 'solid-wood-maintenance',
    title: 'A Craftsman’s Guide to Caring for Teak & White Oak Furniture',
    excerpt:
      'Seasonal humidity changes, natural oils, and preventative techniques to keep your wooden tables and credenzas glowing across decades.',
    content: '',
    category: 'Care & Longevity',
    author: 'Vikram Joshi',
    authorRole: 'Master Carpenter',
    coverImage:
      'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    featured: false,
    publishedAt: '2026-09-18',
    tags: ['Wood Care', 'Maintenance', 'Teak'],
  },
  {
    _id: 'b-4',
    slug: 'curating-the-perfect-living-room',
    title: 'Proportion, Light & Seating: Curating an Open Living Room',
    excerpt:
      'How spatial flow, conversational seating layouts, and low-profile furniture make compact apartments feel grand yet deeply intimate.',
    content: '',
    category: 'Living Well',
    author: 'Aarav Mehta',
    authorRole: 'Head of Furniture Design',
    coverImage:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    readTime: '5 min read',
    featured: false,
    publishedAt: '2026-09-10',
    tags: ['Living Room', 'Space Planning', 'Furniture Layout'],
  },
  {
    _id: 'b-5',
    slug: 'augmented-reality-interior-design',
    title: 'Virtual Space Planning: Designing Your Room with Web AR',
    excerpt:
      'Eliminate guesswork before you invest. Step-by-step guidance on testing scale, clearances, and color harmony using our 3D AR tools.',
    content: '',
    category: 'Design & Interiors',
    author: 'Sunaina Rao',
    authorRole: 'Interior Stylist',
    coverImage:
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    featured: false,
    publishedAt: '2026-09-02',
    tags: ['AR', 'Technology', 'Room Design'],
  },
  {
    _id: 'b-6',
    slug: 'sustainable-textiles-upholstery',
    title: 'Tactile Comfort: The Science Behind Breathable OEKO-TEX Fabrics',
    excerpt:
      'Exploring natural fibres, spill-resistant weaves, and high-abrasion resilience that endure daily family living without compromising softness.',
    content: '',
    category: 'Craft & Material',
    author: 'Vikram Joshi',
    authorRole: 'Master Carpenter',
    coverImage:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
    readTime: '4 min read',
    featured: false,
    publishedAt: '2026-08-28',
    tags: ['Fabrics', 'Sustainability', 'OEKO-TEX'],
  },
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>(FALLBACK_BLOGS);
  const [activeCategory, setActiveCategory] = useState('All Stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/storefront/blogs`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setBlogs(data.data);
          }
        }
      } catch {
        // Fallback to FALLBACK_BLOGS
      }
    };

    fetchBlogs();
  }, []);

  const categories = useMemo(() => {
    return ['All Stories', ...Array.from(new Set(blogs.map((b) => b.category)))];
  }, [blogs]);

  const featuredPost = useMemo(() => {
    return blogs.find((p) => p.featured) || blogs[0];
  }, [blogs]);

  const filteredPosts = useMemo(() => {
    return blogs.filter((post) => {
      const matchesCategory =
        activeCategory === 'All Stories' || post.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [blogs, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-10 md:gap-16 pb-16 font-sans bg-white text-[#1C1A17]">
      {/* ── 1. JODO HERO BANNER (Framed Container) ── */}
      <section className="px-4 lg:px-6 py-0 mt-2 md:mt-4">
        <div className="max-w-[1400px] mx-auto bg-[#FAF7F2] border border-[#EBE3D9] rounded-[24px] md:rounded-[32px] p-6 sm:p-10 md:p-14 lg:p-16 relative overflow-hidden shadow-sm">
          {/* Subtle warm glow background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5EBE0] rounded-full blur-3xl -z-0 pointer-events-none opacity-60" />

          <div className="relative z-10 max-w-[840px]">
            <div className="mb-3 md:mb-4">
              <p className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase">
                The Jodo Journal • Stories of Living
              </p>
            </div>

            <h1 className="font-heading text-[#1C1A17] font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[56px] tracking-tight leading-[1.12] mb-4">
              Furniture, rituals &amp;{' '}
              <span className="text-terracotta italic font-serif font-light">
                the joy of home.
              </span>
            </h1>

            <p className="text-[#57524C] text-sm sm:text-base md:text-lg leading-relaxed max-w-[620px] mb-8 font-normal">
              Design essays, woodworking secrets, living room inspiration, and the quiet satisfaction of making things together.
            </p>

            {/* Embedded Journal Search Bar */}
            <div className="w-full max-w-[500px]">
              <div className="relative flex items-center">
                <Search
                  className="w-5 h-5 text-terracotta absolute left-4 pointer-events-none stroke-[2]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, timber tips, styling..."
                  aria-label="Search articles"
                  className="w-full h-13 pl-12 pr-16 bg-white rounded-full border border-[#DDCFC3] text-[#1C1A17] text-sm md:text-[15px] placeholder-gray-400 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-4 text-xs font-semibold text-gray-500 hover:text-[#1C1A17] bg-[#FAF7F2] rounded-full px-2.5 py-1 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED STORY (JODO Dual-Column Editorial Card) ── */}
      {featuredPost && !searchQuery && activeCategory === 'All Stories' && (
        <section className="max-w-[1400px] mx-auto px-5 md:px-10 w-full">
          <div className="bg-[#FAF9F7] rounded-[28px] md:rounded-[36px] overflow-hidden border border-[#ECE6DE] shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image side */}
              <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto lg:min-h-[460px] overflow-hidden bg-[#EAE2D9]">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                  unoptimized
                />
                <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-terracotta shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Editorial</span>
                </div>
              </div>

              {/* Text side */}
              <div className="lg:col-span-5 p-7 sm:p-10 md:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-[#8E867E] font-semibold mb-3">
                    <span className="text-terracotta uppercase tracking-wider font-bold">
                      {featuredPost.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="font-heading text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#1C1A17] group-hover:text-terracotta transition-colors leading-[1.2] mb-4">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-[#57524C] text-sm md:text-base leading-relaxed line-clamp-3 mb-6 font-normal">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-5 border-t border-[#E8DFD5] flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-bold text-[#1C1A17]">
                      {featuredPost.author}
                    </span>
                    <span className="text-xs text-[#8E867E]">
                      {featuredPost.authorRole || 'Lead Furniture Designer'}
                    </span>
                  </div>

                  {/* JODO Signature Button */}
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="group/btn relative inline-flex items-center gap-2.5 bg-[#1C1A17] text-white rounded-full px-5 py-2.5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                  >
                    <div className="absolute inset-0 bg-terracotta translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-in-out" />
                    <span className="relative z-10 font-bold text-xs sm:text-sm">Read Story</span>
                    <span className="relative z-10 flex items-center justify-center bg-white rounded-full w-6 h-6 group-hover/btn:bg-[#1C1A17] transition-colors duration-500">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#1C1A17] group-hover/btn:text-white transition-colors duration-500" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. JOURNAL ARTICLES GRID SECTION ── */}
      <main className="max-w-[1400px] mx-auto px-5 md:px-10 w-full">
        {/* Category Tabs */}
        <div className="border-b border-[#ECE6DE] mb-10 md:mb-12 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6 md:gap-8 justify-start md:justify-center whitespace-nowrap min-w-max pb-3 px-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === 'All Stories'
                  ? blogs.length
                  : blogs.filter((b) => b.category === cat).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative text-sm md:text-[15px] font-semibold pb-2 transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'text-terracotta font-bold'
                      : 'text-[#666666] hover:text-[#1C1A17]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-terracotta/10 text-terracotta'
                        : 'bg-[#FAF7F2] text-[#8E867E]'
                    }`}
                  >
                    {count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-terracotta rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Article Cards Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#FAF7F2] rounded-[24px] border border-[#E5DDD2]">
            <p className="font-heading text-lg font-bold text-[#1C1A17] mb-2">
              No matching stories found.
            </p>
            <p className="text-sm text-[#666666] mb-6 max-w-md mx-auto">
              We couldn’t find an article matching &ldquo;{searchQuery}&rdquo;. Try another term or browse all topics.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All Stories');
              }}
              className="inline-flex items-center gap-2 bg-[#1C1A17] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-terracotta transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPosts.map((post) => (
              <article
                key={post._id || post.slug}
                className="group flex flex-col bg-[#FAF9F7] rounded-[24px] p-5 sm:p-6 border border-[#ECE6DE] hover:border-terracotta/40 hover:bg-[#FAF6F1] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-500"
              >
                {/* Image Banner */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative aspect-[16/10] w-full rounded-[18px] overflow-hidden bg-[#EFE9E4] block mb-5"
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    unoptimized
                  />
                  <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-terracotta shadow-2xs">
                    {post.category}
                  </span>
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-[#8E867E] font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {post.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-heading text-xl sm:text-[21px] font-bold text-[#1C1A17] group-hover:text-terracotta transition-colors leading-[1.25] mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-[#666666] text-sm leading-relaxed line-clamp-3 mb-6 flex-1 font-normal">
                    {post.excerpt}
                  </p>

                  <div className="pt-4 border-t border-[#E8DFD5] flex items-center justify-between">
                    <span className="text-xs text-[#8E867E] font-medium">By {post.author}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Read Story</span>
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-terracotta group-hover:bg-terracotta group-hover:text-white transition-colors shadow-2xs">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── 4. THE JODO SOCIETY NEWSLETTER (CollectionsSection Style) ── */}
        <section
          aria-labelledby="society-heading"
          className="mt-16 md:mt-24 bg-[#1C1A17] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl"
        >
          {/* Terracotta atmospheric glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <p className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase mb-2">
              The Jodo Society • Monthly Dispatch
            </p>
            <h2
              id="society-heading"
              className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
            >
              Bring timeless craft into{' '}
              <span className="text-terracotta italic font-serif font-light">
                your inbox.
              </span>
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-8 leading-relaxed font-light">
              Curated essays on architecture, early notice for seasonal timber collections, and the secrets of tool-free furniture.
            </p>

            {subscribed ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-4 max-w-md mx-auto flex items-center justify-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-terracotta" />
                <span>You are subscribed to The Jodo Journal!</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubscribed(true);
                }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="flex-1 h-13 px-5 bg-white rounded-full text-sm text-[#1C1A17] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
                <button
                  type="submit"
                  className="h-13 px-8 bg-terracotta hover:bg-[#B54A2D] text-white font-bold text-sm rounded-full transition-all duration-300 shadow-md shrink-0"
                >
                  Join Society
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
