'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Interior Designer',
    content: 'ARView transformed how I present furniture to clients. They can now see exactly how a piece fits in their space before purchasing. Client satisfaction has increased by 40%.',
    rating: 5,
    avatar: 'PS',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    name: 'Rahul Mehta',
    role: 'Home Owner',
    content: 'I was skeptical about buying a sofa online, but the AR preview let me see exactly how it would look in my living room. The dimensions were spot-on. Highly recommend!',
    rating: 5,
    avatar: 'RM',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  },
  {
    name: 'Ananya Patel',
    role: 'Furniture Store Owner',
    content: 'Since implementing QR-based AR previews, our return rate dropped by 60% and customer engagement increased significantly. The technology is seamless.',
    rating: 5,
    avatar: 'AP',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400',
  },
  {
    name: 'Vikram Singh',
    role: 'Architect',
    content: 'As an architect, I use ARView to show clients how furniture will look in their actual spaces. It has become an essential part of my design presentations.',
    rating: 5,
    avatar: 'VS',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  },
  {
    name: 'Deepa Nair',
    role: 'Retail Manager',
    content: 'We integrated ARView QR codes into our showroom displays. Customers love being able to visualize products at home before committing to a purchase.',
    rating: 4,
    avatar: 'DN',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 mb-4 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400"
          >
            ⭐ Testimonials
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What People Say</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Hear from our customers and partners about their AR experience
          </p>
        </div>

        {/* Carousel */}
        <div className="mt-12 relative">
          {/* Desktop: Show 3 cards */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-border/40 hover:border-emerald-200/60 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Quote className="h-8 w-8 text-emerald-200 dark:text-emerald-800" />
                      <div className="flex gap-0.5">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${testimonial.color}`}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mobile/Tablet: Carousel */}
          <div className="lg:hidden">
            <div className="relative overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <Card className="border-border/40 mx-auto max-w-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Quote className="h-8 w-8 text-emerald-200 dark:text-emerald-800" />
                        <div className="flex gap-0.5">
                          {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground min-h-[80px]">
                        &ldquo;{testimonials[current].content}&rdquo;
                      </p>
                      <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${testimonials[current].color}`}>
                          {testimonials[current].avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{testimonials[current].name}</p>
                          <p className="text-xs text-muted-foreground">{testimonials[current].role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === current ? 'w-6 bg-emerald-600' : 'w-2 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
