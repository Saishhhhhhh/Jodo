'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function CTABanner() {
  const { navigateTo } = useAppStore();

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 shadow-2xl shadow-emerald-500/20"
        >
          {/* Animated dashed border glow */}
          <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-white/10 pointer-events-none" />
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 mesh-gradient opacity-40" />
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start gap-8 lg:gap-12">
              {/* Left: Content */}
              <div className="flex-1">
                <Badge className="bg-white/20 text-white border-white/30 gap-1.5 px-3 py-1 text-xs font-medium mb-4">
                  <Sparkles className="h-3 w-3" />
                  Get Started with AR
                </Badge>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to See Products{' '}
                  <span className="text-emerald-200">in Your Space?</span>
                </h2>
                <p className="mt-4 max-w-lg text-base text-emerald-100/80 leading-relaxed">
                  Scan any product QR code with your phone camera to instantly view it in 3D and augmented reality. 
                  No app download needed — works directly in your mobile browser.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                  <Button
                    onClick={() => navigateTo('products')}
                    size="lg"
                    className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg shadow-black/10 px-6 font-semibold transition-all hover:-translate-y-0.5"
                  >
                    Browse All Products
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white bg-white/10 hover:bg-white/20 px-6 transition-all hover:-translate-y-0.5"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Learn About AR
                  </Button>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="hidden lg:flex items-center gap-4 shrink-0">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 2, 0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <QrCode className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/80">Scan QR</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [0, -2, 0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.4 }}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <Smartphone className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/80">View AR</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.8 }}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/80">Decide</span>
                </motion.div>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-8 border-t border-white/20 pt-8">
              {[
                { value: 'Instant', label: '3D Preview' },
                { value: 'No App', label: 'Download Required' },
                { value: '100%', label: 'Free to Use' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-emerald-200/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
