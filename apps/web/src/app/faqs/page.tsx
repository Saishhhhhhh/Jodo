'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiChevronDown, FiArrowUpRight, FiPhone, FiMail } from 'react-icons/fi';
import { HiCheckCircle } from 'react-icons/hi2';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is tool-free flat-pack furniture? How is it different from the IKEA flat-pack I already know?',
    answer: 'Regular flat-pack needs screws, Allen key, some basic tools and 60 minutes of DIY, loose hardware you can lose. JODO panels slide into a connector system entirely by hand: nothing to screw in, nothing to misplace, and disassembly is just as easy unlike conventional flat-pack',
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-2',
    question: 'Is anyone else doing this in India? How do I trust a brand new category?',
    answer: 'Tool-free, connector-based furniture is an established category internationally, conceptually it adapts and modernises centuries old traditional Indian and Japanese tool free joinery. JODO is made for Indian homes, climate, and moving patterns. Our own connector mechanism goes through structural load and repeated assembly-disassembly cycle testing before any SKU ships.',
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-3',
    question: 'JODO is a new brand. How does the warranty work across the product life?',
    answer: "Every order is registered against your account from day one, so warranty cover isn't dependent on a physical card you could lose. Spare connectors and panels are also sold independently of a warranty claim, so the furniture stays repairable regardless of when you bought it, even outside the warranty.",
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-4',
    question: "Can I see or try the product before I buy, since I can't quite picture how 'tool-free' works?",
    answer: 'We currently sell JODO products only via our e-commerce website at www.jodoshop.com. We are in the process of getting ourselves into retail stores by 2027 first quarter',
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-5',
    question: 'Is tool free joinery as safe as screwed-together furniture? Could it loosen or come apart on its own?',
    answer: "The connectors are engineered to slide and lock into place, not just hold by friction, so normal use and moderate load don't make them loose or cause them to come apart. Load-bearing, drop tests, multiple disassembly-assembly cycles, quality performances are tested to BIS structural safety standards",
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-6',
    question: 'Does tool-free mean toy-like, shabby looking pieces compared to traditional screwed-on carpentry furniture?',
    answer: 'No, the connector sits within the panel instead of a visible add-on fitting, so finished pieces look like standard furniture. Once assembled, a JODO piece looks and functions like any other regular furniture',
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-7',
    question: 'Is this safe for homes with young kids or pets?',
    answer: 'Panels have no exposed connectors or sharp hardware edges. Joined panels aren’t something a child or pet can easily loosen. JODO pieces are safe around kids and pets',
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-8',
    question: "What if I assemble it and don't like it? Can I return it?",
    answer: 'Return and trial period window is mentioned in our Returns and Warranty guidelines',
    category: 'New to Tool-Free Furniture?',
  },
  {
    id: 'faq-9',
    question: 'Can I really ditch the tool box to assemble this?',
    answer: 'Yes. Every JODO piece uses our proprietary connector system: no screwdriver, no Allen key, no drilling into walls or floors. Most pieces slide together by hand in under 30 minutes approximately',
    category: 'Assembly & Ease of Use',
  },
  {
    id: 'faq-10',
    question: "I've never assembled furniture before. Will I mess it up?",
    answer: "The connectors are designed to only fit one way, so there's no way to attach a panel incorrectly. Each product ships with a visual, step-by-step guide, plus a QR code linking to a short assembly video.",
    category: 'Assembly & Ease of Use',
  },
  {
    id: 'faq-11',
    question: 'What if I lose a part or a connector breaks?',
    answer: 'Every SKU has spare connectors available to order separately on our website, so a lost or damaged part never means replacing the whole piece.',
    category: 'Assembly & Ease of Use',
  },
  {
    id: 'faq-12',
    question: 'Can one person assemble this alone?',
    answer: 'Certainly, our furniture is built for a simple one person setup, you can grab a friend if you’d like some company',
    category: 'Assembly & Ease of Use',
  },
  {
    id: 'faq-13',
    question: 'I move apartments often: will this survive multiple moves?',
    answer: 'Our core design foundation is to make JODO for people on the go. Furniture disassembles back into flat-pack form just as easily as it assembles, so you can take it apart, move it, and reassemble it without damage and carpenter intervention.',
    category: 'Moving & Renting',
  },
  {
    id: 'faq-14',
    question: 'Will assembling or disassembling this damage my rented walls or floors?',
    answer: "No wall and floor drilling, everything is freestanding and connector-based, so it's landlord- and deposit-friendly.",
    category: 'Moving & Renting',
  },
  {
    id: 'faq-15',
    question: 'Can this fit through narrow stairwells or small elevators?',
    answer: "Yes this ships flat-packed, JODO furniture is built and packaged to fit narrow stairwells and compact lift shafts that assembled furniture often can't",
    category: 'Moving & Renting',
  },
  {
    id: 'faq-16',
    question: 'Which Pincodes are serviceable by JODO?',
    answer: 'You can check our Pincode compatibility option to confirm if JODO delivers or if you need to wait a little longer',
    category: 'Moving & Renting',
  },
  {
    id: 'faq-17',
    question: 'Is tool-free furniture as sturdy as regular furniture?',
    answer: "Tool free doesn't mean flimsy. We use solid wood and plywood in premium laminate finish and high density foam for our upholstered SKUs. Our connector mechanism is tested for quality and built to BIS compliance standards for structural safety and daily use",
    category: 'Quality & Durability',
  },
  {
    id: 'faq-18',
    question: 'Will it hold up in Indian weather and humidity?',
    answer: 'Yes. Materials are selected and climate-tested specifically for Indian conditions (humidity and heat cycles) rather than adapted from a foreign spec sheet. We use solid wood and plywood in premium laminate finish and high density foam for our upholstered SKUs',
    category: 'Quality & Durability',
  },
  {
    id: 'faq-19',
    question: 'How many times can I actually take it apart and put it back together?',
    answer: 'Exact cycle count claim is pending, post manufacturing testings',
    category: 'Quality & Durability',
  },
  {
    id: 'faq-20',
    question: 'What materials does JODO use?',
    answer: 'Solid wood and plywood boards are the primary materials used across the range, metal parts in powder coated finish for some SKUs, 40 density foam for our upholstered pieces and our connectors are fabricated in the highest grade of stainless steel 304. All materials are chosen for structural performance not just appearance',
    category: 'Materials & Origin',
  },
  {
    id: 'faq-21',
    question: 'Is JODO furniture made in India?',
    answer: 'Yes, JODO is designed and manufactured in India, built around Indian homes, climate, and usage rather than adapted from a foreign product line',
    category: 'Materials & Origin',
  },
  {
    id: 'faq-22',
    question: "How do I care for JODO furniture, especially in India's climate?",
    answer: 'Wipe with a soft, lightly damp cloth and dry after: avoid abrasive cleaners, harsh chemicals, and standing water. Keep pieces out of prolonged direct sunlight to prevent discolouration, and away from continuous high humidity or constant dampness where possible. Materials are chosen with Indian conditions in mind, normal care still extends the life of any furniture',
    category: 'Care & Maintenance',
  },
  {
    id: 'faq-23',
    question: 'How is it delivered? Do I need to arrange movers or a carpenter?',
    answer: "It arrives flat-packed at your door, and you assemble it yourself, by hand: no carpenter or installer needed by default. If you'd rather have help anyway, optional Assisted Setup is available as a paid add-on.",
    category: 'Delivery & Logistics',
  },
  {
    id: 'faq-24',
    question: "I'd rather not assemble it myself: can I pay someone to do it for me?",
    answer: 'All JODO pieces can be self assembled but if you’d rather have help, optional Assisted Setup is available as a paid add-on. Technicians are trained specifically to work with our connector systems so the piece is assembled the same way you would do it yourself',
    category: 'Delivery & Logistics',
  },
  {
    id: 'faq-25',
    question: "What's the delivery timeline for Mumbai and Bengaluru?",
    answer: 'We are trying to optimise this further and bring your JODO pieces to you faster. But as of now Mumbai delivery takes 2-7 days and Bengaluru delivery takes 8-10 days. Thank you for your patience',
    category: 'Delivery & Logistics',
  },
  {
    id: 'faq-26',
    question: 'How can I track my JODO order?',
    answer: 'Your order can be tracked through our WhatsApp, SMS and email updates using your order number',
    category: 'Delivery & Logistics',
  },
  {
    id: 'faq-27',
    question: 'Why should I pay this much for flat-pack furniture instead of a local carpenter or a mass-market flat-pack brand?',
    answer: 'JODO is the sweet spot between mass market flat packed furniture that is not built for Indian living and homes with limited durability and the custom carpentry market that is expensive, slow, tool and labour intense. Solid wood and plywood being our core material across SKUs, JODO promises value over years of living with our pieces',
    category: 'Pricing & Value',
  },
  {
    id: 'faq-28',
    question: 'Do you offer EMI, UPI, or Cash on Delivery?',
    answer: 'Yes, we offer EMI, UPI and Cash on Delivery options for all items',
    category: 'Pricing & Value',
  },
  {
    id: 'faq-29',
    question: 'Is there a warranty?',
    answer: "Yes, JODO offers a tiered warranty policy for different SKUs where applicable. Full terms are in JODO's Returns and Warranty guidelines",
    category: 'Returns & Warranty',
  },
  {
    id: 'faq-30',
    question: 'What should I do if my furniture arrives damaged?',
    answer: 'We’re sorry your furniture had a rough trip. Report it within 24 hours with 2-3 clear photos or a short video to our customer support team as soon as you receive the package along with your Order ID. We will raise a claim ticket instantly and a resolution timeline will be communicated to you via WhatsApp, SMS and email',
    category: 'Returns & Warranty',
  },
  {
    id: 'faq-31',
    question: 'What if a part is missing, or a connector breaks later on?',
    answer: "Because the connector system is modular, replacement connectors and panels can be ordered individually from JODO's website so you don't need to wait on a warranty claim or replace the whole piece",
    category: 'Returns & Warranty',
  },
  {
    id: 'faq-32',
    question: 'What if a JODO piece gets damaged due to incorrect, forced installation using tools?',
    answer: 'Kindly refer to our Returns and Warranty guidelines for the same',
    category: 'Returns & Warranty',
  },
  {
    id: 'faq-33',
    question: "Can I return it after I've already assembled it even if there is no damage?",
    answer: 'You will need to reach out to our customer support team for us to understand the cause of return and to asses next steps. Kindly refer to our Returns and Warranty guidelines for the same',
    category: 'Returns & Warranty',
  },
];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
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
            const sanitize = (text: string) => {
              if (!text) return '';
              return text
                .replace(/\s*[—–]\s*could it loosen/gi, '? Could it loosen')
                .replace(/\s*[—–]\s*can I return/gi, '? Can I return')
                .replace(/\s*[—–]\s*will this survive/gi, '. Will this survive')
                .replace(/\s*[—–]\s*do I need/gi, '? Do I need')
                .replace(/\s*[—–]\s*can I pay/gi, ': can I pay')
                .replace(/[—–]/g, ':');
            };

            const formatted: FAQItem[] = json.data.map((item: any) => ({
              id: item._id || item.id,
              question: sanitize(item.question),
              answer: sanitize(item.answer),
              category: item.category || 'General',
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

  // Compute all available categories from loaded FAQs
  const categories = useMemo(() => {
    const baseSet = new Set<string>();
    faqs.forEach((item) => {
      if (item.category) baseSet.add(item.category);
    });
    return ['All', ...Array.from(baseSet)];
  }, [faqs]);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const filteredFAQs = useMemo(() => {
    return faqs.filter((item) => {
      return activeCategory === 'All' || item.category === activeCategory;
    });
  }, [faqs, activeCategory]);

  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-16 font-sans bg-white text-[#1C1A17]">
      {/* ── 1. CLEAN CENTERED JODO HEADER (max-w-[1440px] matching Navbar) ── */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 md:pt-12">
        <div className="text-center max-w-4xl mx-auto px-2">
          <p className="text-terracotta font-bold text-xs sm:text-sm tracking-widest uppercase mb-3">
            The Joy of Together • Help Center
          </p>

          <h1 className="font-heading text-[#1C1A17] font-bold text-2xl sm:text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-[1.12] whitespace-nowrap">
            Frequently Asked Questions.
          </h1>
        </div>
      </section>

      {/* ── 2. COMPACT, SLEEK CATEGORIES (Category name only, small size, best look) ── */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="w-full">
          <div className="flex items-center justify-start md:justify-center flex-wrap gap-2 sm:gap-2.5 overflow-x-auto hide-scrollbar pb-1">
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              const count =
                category === 'All'
                  ? faqs.length
                  : faqs.filter((f) => f.category === category).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    const el = document.getElementById('faqs-list');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-[13px] font-semibold transition-all duration-200 border whitespace-nowrap ${
                    isSelected
                      ? 'bg-terracotta text-white border-terracotta shadow-xs scale-[1.02]'
                      : 'bg-[#FAF7F2] text-[#57524C] border-[#ECE6DE] hover:bg-[#F2ECE4] hover:text-[#1C1A17] hover:border-terracotta/30'
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] sm:text-[11px] font-bold rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#ECE6DE] text-[#666666]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. MAIN FAQ ACCORDION SECTION (max-w-[1440px] matching Navbar) ── */}
      <main id="faqs-list" className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 pt-2">
        <div className="w-full">
          {/* Active Category Header / Question count */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#ECE6DE]/80">
            <h2 className="text-sm sm:text-base font-bold text-[#1C1A17]">
              {activeCategory === 'All' ? 'All Questions' : activeCategory}
              <span className="text-[#8E867E] font-normal text-xs sm:text-sm ml-2">
                ({filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'})
              </span>
            </h2>
          </div>

          {/* FAQ List */}
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16 px-6 bg-[#FAF7F2] rounded-[24px] border border-[#E5DDD2]">
              <p className="font-heading text-lg font-bold text-[#1C1A17] mb-2">
                No questions found in this category.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className="inline-flex items-center gap-2 bg-[#1C1A17] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-terracotta transition-colors mt-2"
              >
                View All Questions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => {
                const isOpen = openId === faq.id;
                const contentId = `faq-answer-${faq.id}`;
                const buttonId = `faq-btn-${faq.id}`;

                return (
                  <div
                    key={faq.id}
                    className={`rounded-[18px] border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-[#FCF6F4] border-terracotta/30 shadow-xs'
                        : 'bg-[#FAF9F7] border-[#ECE6DE] hover:bg-[#F4EFE8] hover:border-[#DDD0C4]'
                    }`}
                  >
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      onClick={() => toggleItem(faq.id)}
                      className="w-full text-left py-4 sm:py-5 px-5 sm:px-7 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <span
                          className={`font-heading text-sm sm:text-base md:text-[17px] font-bold block transition-colors leading-snug ${
                            isOpen ? 'text-[#1C1A17]' : 'text-[#1C1A17]/90'
                          }`}
                        >
                          {faq.question}
                        </span>
                        {activeCategory === 'All' && (
                          <span className="inline-block mt-1 text-[10px] sm:text-[11px] font-semibold text-terracotta uppercase tracking-wider">
                            {faq.category}
                          </span>
                        )}
                      </div>
                      <span
                        className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? 'bg-terracotta text-white rotate-180 shadow-xs'
                            : 'bg-white text-[#666666] shadow-2xs'
                        }`}
                      >
                        <FiChevronDown className="w-4 h-4" />
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
                        <div className="px-5 sm:px-7 pb-5 pt-1 text-[14px] sm:text-[15px] leading-relaxed text-[#57524C] border-t border-[#E8DFD5]/60 font-normal">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 4. CONCIERGE / ASSISTANCE BANNER (Matching Document Footer) ── */}
        <section
          aria-labelledby="concierge-heading"
          className="mt-14 md:mt-20 w-full bg-[#1C1A17] text-white rounded-[28px] md:rounded-[36px] p-8 sm:p-12 md:p-14 relative overflow-hidden shadow-xl"
        >
          {/* Terracotta atmospheric glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase mb-2">
                Still Need Help?
              </p>
              <h2
                id="concierge-heading"
                className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight tracking-tight"
              >
                Don’t worry, we got you.
              </h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed font-light mb-4">
                Drop a note to our team or chat with us. We’re here to help with orders, custom dimensions, timber samples, and assembly questions.
              </p>

              <div className="flex items-center gap-6 text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <HiCheckCircle className="w-4 h-4 text-terracotta" /> 5-Year Warranty
                </span>
                <span className="flex items-center gap-1.5">
                  <HiCheckCircle className="w-4 h-4 text-terracotta" /> Free Doorstep Delivery
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* Email concierge */}
              <a
                href="mailto:hello@jodoshop.com"
                className="group relative inline-flex items-center gap-3 bg-terracotta text-white rounded-full px-6 py-3.5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 justify-center whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                <FiMail className="relative z-10 w-4 h-4 text-white group-hover:text-[#1C1A17] transition-colors" />
                <span className="relative z-10 font-bold text-sm group-hover:text-[#1C1A17] transition-colors">
                  hello@jodoshop.com
                </span>
                <span className="relative z-10 flex items-center justify-center bg-white rounded-full w-6 h-6 group-hover:bg-[#1C1A17] transition-colors duration-500">
                  <FiArrowUpRight className="w-3.5 h-3.5 text-terracotta group-hover:text-white transition-colors duration-500" />
                </span>
              </a>

              {/* Chat / Call Button */}
              <a
                href="tel:+919876543210"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white hover:text-[#1C1A17] rounded-full px-6 py-3.5 font-semibold text-sm transition-all duration-300 whitespace-nowrap"
              >
                <FiPhone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
