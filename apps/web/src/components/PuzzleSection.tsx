'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const IMAGE_URL = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85';

export default function PuzzleSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // We track the scroll progress through the massive 300vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // We want the puzzle to snap together from 0% to 50% of the scroll, 
  // and then stay assembled for the rest of the scroll.
  const assembleProgress = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  // Define the animations for the 4 pieces (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
  
  // TOP LEFT: flies in from top-left, rotated negatively
  const tlX = useTransform(assembleProgress, [0, 1], ['-100vw', '0%']);
  const tlY = useTransform(assembleProgress, [0, 1], ['-100vh', '0%']);
  const tlRotate = useTransform(assembleProgress, [0, 1], [-45, 0]);

  // TOP RIGHT: flies in from top-right, rotated positively
  const trX = useTransform(assembleProgress, [0, 1], ['100vw', '0%']);
  const trY = useTransform(assembleProgress, [0, 1], ['-100vh', '0%']);
  const trRotate = useTransform(assembleProgress, [0, 1], [45, 0]);

  // BOTTOM LEFT: flies in from bottom-left
  const blX = useTransform(assembleProgress, [0, 1], ['-100vw', '0%']);
  const blY = useTransform(assembleProgress, [0, 1], ['100vh', '0%']);
  const blRotate = useTransform(assembleProgress, [0, 1], [-45, 0]);

  // BOTTOM RIGHT: flies in from bottom-right
  const brX = useTransform(assembleProgress, [0, 1], ['100vw', '0%']);
  const brY = useTransform(assembleProgress, [0, 1], ['100vh', '0%']);
  const brRotate = useTransform(assembleProgress, [0, 1], [45, 0]);

  // Fade out the text as the puzzle finishes assembling
  const textOpacity = useTransform(assembleProgress, [0.8, 1], [1, 0]);
  const textY = useTransform(assembleProgress, [0.8, 1], ['0%', '-50%']);

  // Reveal the final completed text/button when assembled
  const finalOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const finalY = useTransform(scrollYProgress, [0.7, 0.9], ['50px', '0px']);

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-[#F9F6F0]">
      {/* Sticky container that stays fixed to viewport while we scroll the 300vh height */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">
        
        {/* Intro Text behind the puzzle */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }}
          className="absolute z-0 flex flex-col items-center text-center px-4"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-[#1C1A17] mb-6 tracking-tight max-w-[800px]">
            Bringing the missing pieces of your home <span className="text-terracotta italic font-serif font-light">together</span>.
          </h2>
          <p className="text-gray-600 text-xl max-w-[500px]">
            Keep scrolling to reveal the big picture.
          </p>
        </motion.div>

        {/* Puzzle Container */}
        <div className="relative z-10 w-[90vw] max-w-[1000px] aspect-video">
          
          {/* Top Left Piece */}
          <motion.div
            style={{ x: tlX, y: tlY, rotate: tlRotate }}
            className="absolute top-0 left-0 w-1/2 h-1/2 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/20 rounded-tl-[40px]"
          >
            <div className="relative w-[200%] h-[200%] left-0 top-0">
              <Image src={IMAGE_URL} alt="Puzzle" fill className="object-cover" unoptimized />
            </div>
          </motion.div>

          {/* Top Right Piece */}
          <motion.div
            style={{ x: trX, y: trY, rotate: trRotate }}
            className="absolute top-0 right-0 w-1/2 h-1/2 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/20 rounded-tr-[40px]"
          >
            <div className="relative w-[200%] h-[200%] right-[100%] top-0">
              <Image src={IMAGE_URL} alt="Puzzle" fill className="object-cover" unoptimized />
            </div>
          </motion.div>

          {/* Bottom Left Piece */}
          <motion.div
            style={{ x: blX, y: blY, rotate: blRotate }}
            className="absolute bottom-0 left-0 w-1/2 h-1/2 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/20 rounded-bl-[40px]"
          >
            <div className="relative w-[200%] h-[200%] left-0 bottom-[100%]">
              <Image src={IMAGE_URL} alt="Puzzle" fill className="object-cover" unoptimized />
            </div>
          </motion.div>

          {/* Bottom Right Piece */}
          <motion.div
            style={{ x: brX, y: brY, rotate: brRotate }}
            className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/20 rounded-br-[40px]"
          >
            <div className="relative w-[200%] h-[200%] right-[100%] bottom-[100%]">
              <Image src={IMAGE_URL} alt="Puzzle" fill className="object-cover" unoptimized />
            </div>
          </motion.div>

          {/* Overlay Content that appears when puzzle is done */}
          <motion.div 
            style={{ opacity: finalOpacity, y: finalY }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 rounded-[40px] backdrop-blur-sm transition-colors duration-1000"
          >
            <h3 className="text-white text-5xl font-bold mb-6 text-center">
              The Perfect Fit
            </h3>
            <button className="bg-white text-[#1C1A17] font-semibold px-8 py-4 rounded-full hover:bg-terracotta hover:text-white transition-colors duration-300">
              Shop The Room
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
