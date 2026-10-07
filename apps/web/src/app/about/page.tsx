'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Puzzle, ShieldCheck, Award, Recycle } from 'lucide-react';

import TextPressure from '@/components/TextPressure';

const HORIZONTAL_ITEMS = [
  {
    chapter: "Chapter 01",
    title: "The Idea",
    desc: `Here's the thing nobody tells you about furniture in India: it was never actually built for you.

The carpenter route is slow, unpredictable, and expensive. Flat-pack & existing furniture online solved "fits in a box" problem and created three new problems: tools you don't own, a Saturday you didn't plan to lose, and furniture that doesn't survive being taken apart more than once. We asked: why does furniture in India still require a carpenter, a truck, a wait, and a headache? JODO was born from the belief that there had to be a better way.`,
    img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
  },
  {
    chapter: "Chapter 02",
    title: "The Design",
    desc: `We stripped everything back. No unnecessary screws. No complicated manuals. And we didn't stop at the mechanism: the materials had to do the heavy lifting here too. Sturdy wood and plywood with premium panel finishes, stainless steel hardware and connectors, Indian craftsmanship reinvented with a global design agenda`,
    img: "https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    chapter: "Chapter 03",
    title: "The Making",
    desc: `JODO is designed and made in-house right here in Mumbai. Every piece starts with the connector, not the furniture: we design the joinery first, then build the piece around it. We control every step, every sketch, every moodboard and every selection - because quality should never be an afterthought.`,
    img: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80"
  },
  {
    chapter: "Chapter 04",
    title: "The Moment",
    desc: `It shows up flat-packed: no carpenter, no installer, no appointment window you have to stay home for. You open the box, and everything you need is already in it: numbered panels with fitted connectors, a visual guide that doesn't assume you've done this before. Assembly takes minutes, not your weekend! When you open the box and put it together yourself, something shifts. It is not just furniture anymore, it is yours.`,
    img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
  }
];

const WHY_CHOOSE_CARDS = [
  {
    num: "01",
    title: "Designed to Assemble, Built to Last",
    desc: "JODO was created for real life, furniture that adapts to your home, not the other way around. No screws. No drilling. No mess. No carpenter between you and a finished room.",
    Icon: Puzzle
  },
  {
    num: "02",
    title: "Made In-House, Made for India",
    desc: "Every single panel has a purpose and a design philosophy around it. Every connector is placed with mechanical precision so your pieces slide into each other in perfect unison. Consistency and quality are not afterthoughts, they are at the core of JODO",
    Icon: ShieldCheck
  },
  {
    num: "03",
    title: "Built on Trust, not fine print",
    desc: "Tool-free is not a trade-off against good design and good design should be accessible to all. Furniture should earn trust through clarity, not hide behind colours and fine print; that's our purpose at JODO",
    Icon: Award
  },
  {
    num: "04",
    title: "Sustainable Circular Design",
    desc: "JODO pieces are modular and circular in design, which means that nothing about a piece of JODO furniture is disposable. A panel or connector can be easily replaced without replacing the entire furniture. Our pieces are flat packed intelligently and delivered efficiently, even if your piece has had a rough journey to your home.",
    Icon: Recycle
  }
];

export default function AboutPage() {
  // Refs for scroll tracking
  const horizontalRef = useRef<HTMLElement>(null);

  // Horizontal Scroll Math (4 items = slide to -75%)
  const { scrollYProgress: horizontalScroll } = useScroll({
    target: horizontalRef,
    offset: ["start start", "end end"]
  });
  const smoothHorizontalScroll = useSpring(horizontalScroll, { stiffness: 100, damping: 30, restDelta: 0.001 });
  // Finish horizontal sliding at 80% scroll progress to give the 4th slide time to rest before scrolling away
  const xTransform = useTransform(smoothHorizontalScroll, [0, 0.8], ["0%", "-75%"]);

  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* 2.1 Hero Section */}
      <section className="h-[60vh] md:h-screen w-full relative bg-white overflow-hidden flex items-center justify-center mt-16 md:mt-0">
        
        {/* TextPressure Layer */}
        <div className="relative z-10 w-full max-w-[85vw] sm:max-w-[75vw] md:max-w-[60vw] h-[160px] sm:h-[240px] md:h-[400px] pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <TextPressure
              text="JODO"
              flex
              alpha={false}
              stroke={false}
              width
              weight
              italic
              textColor="#c85a3c"
              strokeColor="#c85a3c"
              minFontSize={36}
            />
          </div>
        </div>
        
      </section>

      {/* 2.2 Horizontal Scroll Gallery */}
      <section ref={horizontalRef} className="h-[500vh] relative bg-[#FCF6F4] overflow-x-clip">
        <div className="sticky top-0 h-screen w-full pt-16 sm:pt-20 lg:pt-[110px] flex items-center">
          
          {/* Container is 400vw. We slide it left by 75% (300vw) so it perfectly stops at the end */}
          <motion.div style={{ x: xTransform, willChange: "transform" }} className="flex w-[400vw] h-full items-center">
            {HORIZONTAL_ITEMS.map((item, i) => (
              <div 
                key={i} 
                className="w-[100vw] h-full relative flex flex-col lg:flex-row items-center justify-center px-5 sm:px-12 lg:px-24 my-auto"
              >
                {/* Huge Watermark Number */}
                <div className="absolute top-[-20px] sm:top-0 md:top-[10%] left-1/2 -translate-x-1/2 lg:top-[40px] lg:left-[-100px] lg:translate-x-0 text-[8rem] sm:text-[10rem] lg:text-[12rem] font-bold text-[#D1C4B7]/30 leading-none pointer-events-none z-0 tracking-tighter select-none">
                  0{i + 1}
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-12 lg:gap-20 items-center w-full max-w-6xl mx-auto">

                  {/* Editorial Image Frame */}
                  <div className="w-full sm:w-[75%] lg:w-[45%] h-[160px] sm:h-[220px] md:h-[300px] lg:h-[420px] relative rounded-[20px] sm:rounded-[24px] overflow-hidden z-10 group shadow-lg mx-auto shrink-0">
                    <Image 
                      src={item.img} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-all duration-1000" 
                      alt={item.title}
                    />
                  </div>
                  
                  {/* Text Box */}
                  <div className="w-full lg:w-[55%] flex flex-col relative z-20 pt-2 lg:pt-0 lg:pl-12 text-center lg:text-left items-center lg:items-start">
                     <div className="w-16 h-[3px] bg-terracotta mb-3 md:mb-5" />
                     <span className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase mb-1.5 md:mb-2">
                       {item.chapter}
                     </span>
                     <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#1C1A17] mb-3 md:mb-5 tracking-tight leading-[1.15]">
                       {item.title}
                     </h2>
                     <div className="text-[14px] sm:text-[15px] lg:text-[17px] text-[#4A4640] leading-relaxed font-normal space-y-3 max-w-xl">
                       {item.desc.split('\n\n').map((para, pIdx) => (
                         <p key={pIdx}>{para}</p>
                       ))}
                     </div>
                  </div>

                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* 2.3 Brand story */}
      <section className="relative w-full max-w-[1400px] mx-auto px-5 md:px-10 py-16 md:py-32 bg-white">
        
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 md:gap-16 lg:gap-24">

          {/* -- LEFT SIDE: Text -- */}
          <div className="flex-1 max-w-[620px]">
            
            <div className="mb-3 md:mb-6">
              <p className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase">
                Our Story
              </p>
            </div>

            <h2 className="text-[#1C1A17] font-bold mb-4 md:mb-8 tracking-tight leading-[1.15] text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              Furniture should be as joyful to own as it is to use.
            </h2>
            
            <div className="space-y-4 md:space-y-6 text-gray-600 leading-relaxed text-[15px] md:text-lg">
              <p>
                JODO exists because &ldquo;that&apos;s just how furniture is&rdquo; was never a good enough answer. This journey began with a simple question: why is buying furniture in India still so complicated? The waiting, the carpenter, the confusion: none of it needed to exist.
              </p>
              <p>
                So we got annoyed enough to do something about it: annoyed with paying full price for furniture that couldn&apos;t survive the one thing we needed it to do, with assembly instructions that assumed engineering-level patience, with watching perfectly decent furniture get abandoned because taking it apart or transporting it wasn&apos;t an option. We combined thoughtful engineering with premium materials to build something new: furniture that assembles like a puzzle, ships flat, and keeps up with you.
              </p>
            </div>
          </div>

          {/* -- RIGHT SIDE: Images -- */}
          <div className="flex-1 w-full relative">
            
            <div className="relative w-full aspect-square md:aspect-[10/9]">
              {/* Main Large Image */}
              <div className="absolute inset-0 rounded-[40px] overflow-hidden group z-0">
                <Image
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
                  alt="Our Story main"
                  fill
                  className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                  unoptimized
                />
              </div>

              {/* Solid White Cutout Block */}
              <div className="absolute left-[-2px] bottom-[-2px] z-10 w-[55%] h-[55%] bg-white rounded-tr-[32px]">
                
                {/* Inverted corner - Top side */}
                <svg className="absolute top-[-30px] left-0 w-[32px] h-[32px] z-20" viewBox="0 0 32 32" fill="none">
                  <path d="M0 0v32h32C14.327 32 0 17.673 0 0z" fill="white" />
                </svg>

                {/* Inverted corner - Right side */}
                <svg className="absolute bottom-0 right-[-30px] w-[32px] h-[32px] z-20" viewBox="0 0 32 32" fill="none">
                  <path d="M32 32H0V0c0 17.673 14.327 32 32 32z" fill="white" />
                </svg>

                {/* Overlapping Secondary Image */}
                <div className="absolute left-0 bottom-0 w-[92%] h-[92%] rounded-[28px] overflow-hidden group">
                  <Image
                    src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80"
                    alt="Our Story detail"
                    fill
                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                    unoptimized
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2.4 Crafting excellence */}
      <section className="relative w-full max-w-[1400px] mx-auto px-5 md:px-10 pb-16 pt-8 md:py-32 bg-white">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-16 lg:gap-24">
          
          {/* -- LEFT SIDE: Image -- */}
          <div className="flex-1 w-full relative">
            <div className="relative w-full aspect-[4/5] md:aspect-square">
              <div className="absolute inset-0 rounded-[40px] overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
                  alt="Crafting process"
                  fill
                  className="object-cover object-center transition-transform duration-[2s] ease-out group-hover:scale-105"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* -- RIGHT SIDE: Text -- */}
          <div className="flex-1 max-w-[620px] pt-4 lg:pt-0">
            <div className="mb-3 md:mb-6">
              <p className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase">
                How We Build
              </p>
            </div>

            <h2 className="text-[#1C1A17] font-bold mb-4 md:mb-8 tracking-tight leading-[1.15] text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              Every panel is made in-house. Every connector is engineered to last.
            </h2>
            
            <div className="space-y-4 md:space-y-6 text-gray-600 leading-relaxed text-[15px] md:text-lg">
              <p>
                Our connectors go through structural load testing and repeated assembly-disassembly cycles before it&apos;s allowed anywhere near a real product, because &ldquo;slides together nicely&rdquo; and &ldquo;surviving in Indian homes&rdquo; are two very different engineering problems. Materials are picked for Indian conditions, not adapted from them. JODO controls its own manufacturing. We work directly with premium wood and plywood suppliers and design every piece ourselves. No middlemen. No shortcuts. No compromise.
              </p>
              <p className="font-medium text-[#1C1A17] pt-2">
                We save you time for you to finish that book, listen to that podcast or binge watch your favourite show while lounging on our pieces that YOU put together.
              </p>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2.5 Why choose JODO: four cards */}
      <section className="w-full bg-[#FCF6F4] relative z-10 py-16 md:py-32">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          
          <div className="mb-10 md:mb-20 text-center max-w-3xl mx-auto">
            <span className="text-terracotta font-bold text-xs md:text-sm tracking-widest uppercase mb-3 block">
              The JODO Difference
            </span>
            <h2 className="text-[#1C1A17] font-bold mb-4 tracking-tight leading-[1.15] text-3xl sm:text-4xl md:text-5xl">
              Why choose JODO?
            </h2>
          </div>

          {/* Four Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {WHY_CHOOSE_CARDS.map(({ num, title, desc, Icon }) => (
              <div 
                key={title}
                className="group relative p-8 md:p-10 rounded-[32px] bg-white overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#FCF6F4] flex items-center justify-center group-hover:bg-terracotta transition-colors duration-500">
                      <Icon className="w-7 h-7 text-terracotta group-hover:text-white transition-colors duration-500 stroke-[1.5]" />
                    </div>
                    <span className="text-sm font-bold text-terracotta tracking-wider">
                      {num}
                    </span>
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold tracking-tight text-[#1C1A17] mb-3">
                    {title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-[15px] md:text-base">
                    {desc}
                  </p>
                </div>
                <span className="absolute -bottom-6 -right-3 text-[140px] font-bold text-[#F5EBE8]/60 leading-none pointer-events-none select-none z-0">
                  {num}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
