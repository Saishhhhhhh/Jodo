'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ChevronDown,
  ArrowUpRight,
  Phone,
  MessageSquare,
  Puzzle,
  PackageCheck,
  ShieldCheck,
  Wrench,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Orders & Delivery' | 'Materials & Care' | 'Warranty & Returns' | 'Assembly & Service';
}

const CATEGORIES = [
  'All',
  'Assembly & Service',
  'Orders & Delivery',
  'Materials & Care',
  'Warranty & Returns',
] as const;

type CategoryType = (typeof CATEGORIES)[number];

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does JODO tool-free click assembly actually work?',
    answer:
      'Every JODO furniture piece is precision-engineered with interlocking joint systems. The components slide and lock securely into place like a puzzle without needing allen keys, screws, screwdrivers, or a professional carpenter. Most pieces can be fully assembled in 5–10 minutes by one or two people.',
    category: 'Assembly & Service',
  },
  {
    id: 'faq-2',
    question: 'Do I need any tools or a carpenter to set up my furniture?',
    answer:
      'None at all! Zero tools are required. We design our furniture specifically so you never have to wait for a carpenter or decipher complicated hardware bags. If you ever prefer a helping hand, our team can arrange technician assistance upon request.',
    category: 'Assembly & Service',
  },
  {
    id: 'faq-3',
    question: 'How long does shipping and delivery take?',
    answer:
      'Standard in-stock furniture items are dispatched within 48 hours and delivered within 5–9 business days depending on your postal code. Custom-finished pieces take 2–3 weeks. You will receive live GPS tracking links via SMS and email with scheduled doorstep delivery slots.',
    category: 'Orders & Delivery',
  },
  {
    id: 'faq-4',
    question: 'Do you offer free delivery across India?',
    answer:
      'Yes! We provide complimentary doorstep shipping on all orders over ₹4,999 to over 15,000 pin codes nationwide. Our delivery partners handle transit with heavy-duty reinforced flat-pack packaging designed to prevent edge impact during transport.',
    category: 'Orders & Delivery',
  },
  {
    id: 'faq-5',
    question: 'Can I modify or cancel my order after placing it?',
    answer:
      'You can modify dimensions, change delivery addresses, or cancel for a 100% full refund within 24 hours of placing your order. After 24 hours, orders enter CNC cutting and woodworking. Simply reach out to our concierge team with your order ID.',
    category: 'Orders & Delivery',
  },
  {
    id: 'faq-6',
    question: 'What materials and timber does JODO use?',
    answer:
      'We use sustainably harvested, premium architectural plywood and solid hardwoods like European White Oak and seasoned Teak. Our surfaces are sealed with natural, non-toxic water-based matte polyurethanes that protect the grain while preserving the authentic, warm tactile feel of real wood.',
    category: 'Materials & Care',
  },
  {
    id: 'faq-7',
    question: 'How should I maintain and care for my wood surfaces?',
    answer:
      'Wipe down periodically with a clean, slightly damp microfibre cloth. Avoid harsh chemical sprays or abrasive scouring pads. For long-term luster, apply natural beeswax or Danish wood oil every 6–12 months. Keep your pieces away from direct continuous rain or extreme heating ducts.',
    category: 'Materials & Care',
  },
  {
    id: 'faq-8',
    question: 'Can I order custom dimensions or fabric swatches?',
    answer:
      'Yes, select collections support tailored sizing and over 40+ curated fabric swatches. Contact our design concierge team via the Contact page or live chat to request complimentary fabric sample swatches delivered right to your home.',
    category: 'Materials & Care',
  },
  {
    id: 'faq-9',
    question: 'What is JODO’s warranty coverage?',
    answer:
      'Every JODO furniture piece comes with a comprehensive 5-year structural warranty covering joint integrity, timber stability, and manufacturing craftsmanship. Upholstery fabrics, foams, and hinges are covered under our 2-year peace-of-mind guarantee.',
    category: 'Warranty & Returns',
  },
  {
    id: 'faq-10',
    question: 'What is your return and exchange policy?',
    answer:
      'We provide an easy 7-day doorstep return policy from the date of delivery. If a piece does not suit your room dimensions or arrives with transit damage, we arrange a pickup and initiate an immediate replacement or full refund to your original payment method.',
    category: 'Warranty & Returns',
  },
];

const TOPIC_CARDS = [
  {
    icon: Puzzle,
    title: 'Tool-Free Assembly',
    category: 'Assembly & Service' as CategoryType,
    desc: 'Interlocking click joints. Zero screws, zero allen keys.',
  },
  {
    icon: PackageCheck,
    title: 'Orders & Delivery',
    category: 'Orders & Delivery' as CategoryType,
    desc: 'Flat-packed delivery to 15,000+ pin codes nationwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Materials & Care',
    category: 'Materials & Care' as CategoryType,
    desc: 'Architectural plywood, solid hardwood & natural finishes.',
  },
  {
    icon: Wrench,
    title: 'Warranty & Returns',
    category: 'Warranty & Returns' as CategoryType,
    desc: '5-year structural guarantee with 7-day hassle-free returns.',
  },
];

const QUICK_SEARCH_TAGS = [
  'Click Assembly',
  'Delivery Time',
  'Plywood & Timber',
  'Warranty',
  'Returns',
];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq-1');

  // Fetch live FAQs from backend if available
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/storefront/faqs`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const formatted: FAQItem[] = json.data.map((item: any) => ({
              id: item._id || item.id,
              question: item.question,
              answer: item.answer,
              category: item.category,
            }));
            setFaqs(formatted);
          }
        }
      } catch {
        // Fallback to DEFAULT_FAQS
      }
    };

    fetchFaqs();
  }, []);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFAQs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [faqs, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-10 md:gap-16 pb-16 font-sans bg-white text-[#1C1A17]">
      {/* ── 1. JODO HERO BANNER (Framed Container) ── */}
      <section className="px-4 lg:px-6 py-0 mt-2 md:mt-4">
        <div className="max-w-[1400px] mx-auto bg-[#FAF7F2] border border-[#EBE3D9] rounded-[24px] md:rounded-[32px] p-6 sm:p-10 md:p-14 lg:p-16 relative overflow-hidden shadow-sm">
          {/* Subtle architectural warm glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F5EBE0] rounded-full blur-3xl -z-0 pointer-events-none opacity-60" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="mb-3 md:mb-4">
                <p className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase">
                  The Joy of Together • Help &amp; Care
                </p>
              </div>

              <h1 className="font-heading text-[#1C1A17] font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-[1.12] mb-4">
                Questions about JODO?{' '}
                <span className="text-terracotta italic font-serif font-light">
                  We’ve got you covered.
                </span>
              </h1>

              <p className="text-[#57524C] text-sm sm:text-base md:text-lg leading-relaxed max-w-[560px] mb-6 md:mb-8 font-normal">
                Everything you need to know about our tool-free click assembly, sustainably crafted hardwoods, flat-pack delivery, and lifetime care.
              </p>

              {/* JODO Search Bar */}
              <div className="w-full max-w-[540px]">
                <div className="relative flex items-center">
                  <Search
                    className="w-5 h-5 text-terracotta absolute left-4 pointer-events-none stroke-[2]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions (e.g. assembly, warranty, shipping)..."
                    aria-label="Search FAQs"
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

                {/* Quick Search Chips */}
                <div className="flex items-center gap-2 flex-wrap mt-3 pt-1">
                  <span className="text-xs text-[#8E867E] font-medium">Popular:</span>
                  {QUICK_SEARCH_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="text-xs font-medium bg-white hover:bg-terracotta hover:text-white text-[#57524C] px-3 py-1 rounded-full border border-[#E5DDD2] transition-colors shadow-2xs"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Visual Card (JODO Signature Badge & Image) */}
            <div className="lg:col-span-5 relative hidden sm:block">
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-md border border-[#E5DDD2] group">
                <Image
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
                  alt="JODO click together furniture"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating pill badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-terracotta shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Built in Minutes</span>
                </div>

                {/* Bottom caption */}
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="font-heading font-bold text-lg md:text-xl leading-snug">
                    Tool-Free Click Assembly
                  </p>
                  <p className="text-xs md:text-sm text-white/80 mt-1">
                    Slides and locks like a jigsaw puzzle. Designed for the moments you build together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. QUICK TOPIC CARDS (FeaturesBar Style) ── */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {TOPIC_CARDS.map(({ icon: Icon, title, category, desc }) => {
            const isSelected = activeCategory === category;
            return (
              <button
                key={title}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  const el = document.getElementById('faqs-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-left p-5 md:p-6 rounded-[20px] transition-all duration-300 group flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-[#FCF6F4] border-terracotta shadow-sm -translate-y-1'
                    : 'bg-[#FAF9F7] border-[#ECE6DE] hover:bg-[#F2ECE4] hover:border-terracotta/30 hover:-translate-y-1'
                }`}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 transition-all duration-300 shadow-sm ${
                      isSelected
                        ? 'bg-terracotta text-white scale-110'
                        : 'bg-white text-terracotta group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h2 className="font-heading text-[#111111] font-bold text-[16px] sm:text-[17px] mb-1.5 tracking-tight leading-snug">
                    {title}
                  </h2>
                  <p className="text-[#666666] text-[12px] sm:text-[13px] leading-relaxed font-medium">
                    {desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DFD5] flex items-center gap-1.5 text-xs font-bold text-terracotta">
                  <span>Browse questions</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. MAIN FAQ ACCORDION SECTION ── */}
      <main id="faqs-list" className="max-w-[1040px] mx-auto px-5 md:px-10 w-full pt-4">
        {/* Category Tabs */}
        <div className="border-b border-[#ECE6DE] mb-8 md:mb-12 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6 md:gap-8 justify-start md:justify-center whitespace-nowrap min-w-max pb-3 px-1">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              const count =
                category === 'All'
                  ? faqs.length
                  : faqs.filter((f) => f.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`relative text-sm md:text-[15px] font-semibold pb-2 transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'text-terracotta font-bold'
                      : 'text-[#666666] hover:text-[#1C1A17]'
                  }`}
                >
                  <span>{category}</span>
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

        {/* FAQ List */}
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#FAF7F2] rounded-[24px] border border-[#E5DDD2]">
            <p className="font-heading text-lg font-bold text-[#1C1A17] mb-2">
              No matching questions found.
            </p>
            <p className="text-sm text-[#666666] mb-6 max-w-md mx-auto">
              We couldn’t find an answer for &ldquo;{searchQuery}&rdquo;. Try another term or speak directly with our concierge.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="inline-flex items-center gap-2 bg-[#1C1A17] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-terracotta transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFAQs.map((faq) => {
              const isOpen = openId === faq.id;
              const contentId = `faq-answer-${faq.id}`;
              const buttonId = `faq-btn-${faq.id}`;

              return (
                <div
                  key={faq.id}
                  className={`rounded-[20px] border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? 'bg-[#FCF6F4] border-terracotta/30 shadow-sm'
                      : 'bg-[#FAF9F7] border-[#ECE6DE] hover:bg-[#F4EFE8] hover:border-[#DDD0C4]'
                  }`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left py-5 px-5 sm:px-8 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  >
                    <span
                      className={`font-heading text-base md:text-[17px] font-bold transition-colors ${
                        isOpen ? 'text-[#1C1A17]' : 'text-[#1C1A17]/90'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-terracotta text-white rotate-180 shadow-xs'
                          : 'bg-white text-[#666666] shadow-2xs'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0 invisible'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-8 pb-6 pt-1 text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#57524C] border-t border-[#E8DFD5]/60 font-normal">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 4. CONCIERGE / ASSISTANCE BANNER (Collections / About Style) ── */}
        <section
          aria-labelledby="concierge-heading"
          className="mt-14 md:mt-20 bg-[#1C1A17] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-14 relative overflow-hidden shadow-xl"
        >
          {/* Terracotta atmospheric glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase mb-2">
                Need Personal Assistance?
              </p>
              <h2
                id="concierge-heading"
                className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight tracking-tight"
              >
                Still have a question about your home?
              </h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed font-light">
                Our in-house design team is ready to help with custom dimensions, timber swatches, order updates, or assembly assistance.
              </p>

              <div className="flex items-center gap-6 mt-6 text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-terracotta" /> 5-Year Warranty
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-terracotta" /> Free Doorstep Delivery
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* JODO Signature Button */}
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-3 bg-terracotta text-white rounded-full px-6 py-3.5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 justify-center whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                <span className="relative z-10 font-bold text-sm group-hover:text-[#1C1A17] transition-colors">
                  Contact Concierge
                </span>
                <span className="relative z-10 flex items-center justify-center bg-white rounded-full w-7 h-7 group-hover:bg-[#1C1A17] transition-colors duration-500">
                  <ArrowUpRight className="w-3.5 h-3.5 text-terracotta group-hover:text-white transition-colors duration-500" />
                </span>
              </Link>

              {/* Secondary Call Button */}
              <a
                href="tel:+918001234567"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white hover:text-[#1C1A17] rounded-full px-6 py-3 font-semibold text-sm transition-all duration-300 whitespace-nowrap"
              >
                <Phone className="w-4 h-4" />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
