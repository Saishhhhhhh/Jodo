'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Sparkles, Box, QrCode, Eye, RotateCcw, Star, Users, Scan } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useMemo } from 'react';
import AnimatedCounter from '@/components/ui/animated-counter';

export default function HeroSection() {
  const { navigateTo, allProducts, productsLoaded } = useAppStore();
  const heroImage = '/hero-banner.png';

  const stats = useMemo(() => {
    const products = allProducts || [];
    const categories = [...new Set(products.map(p => p.category))];
    const modelsWithGLB = products.filter(p => p.model.glbUrl && !p.model.glbUrl.endsWith('/') && p.model.glbUrl !== '/models/');
    return {
      products: productsLoaded ? products.length : 50,
      categories: productsLoaded ? categories.length : 6,
      arReady: productsLoaded ? Math.round((modelsWithGLB.length / Math.max(products.length, 1)) * 100) : 100,
    };
  }, [allProducts, productsLoaded]);

  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-background dark:from-emerald-950/30 dark:via-teal-950/10 dark:to-background" />
      
      {/* Animated background blobs */}
      <div className="absolute top-20 right-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-800/20 animate-pulse" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl dark:bg-teal-800/10 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-cyan-200/20 blur-3xl dark:bg-cyan-800/10 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="secondary" className="mb-4 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                Web AR Technology
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="text-foreground">View Products in</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Your Own Space
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg mx-auto lg:mx-0"
            >
              Scan a QR code, and instantly see how any product looks in your room. 
              Experience furniture, decor, and more in augmented reality before you buy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <Button
                onClick={() => navigateTo('products')}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 text-white px-6 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              >
                Explore Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 px-6 transition-all hover:-translate-y-0.5"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <QrCode className="mr-2 h-4 w-4" />
                How It Works
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex flex-wrap items-center gap-4 justify-center lg:justify-start"
            >
              {[
                { icon: Star, text: 'Free AR Preview' },
                { icon: Users, text: 'Trusted by 1000+' },
                { icon: Scan, text: 'Instant QR Access' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Stats with Animated Counters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-10 grid grid-cols-3 gap-6 border-t border-border/40 pt-8 max-w-md mx-auto lg:mx-0"
            >
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-emerald-600">
                  <AnimatedCounter
                    value={stats.products}
                    suffix={stats.products >= 50 ? '+' : ''}
                    duration={1200}
                  />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">AR Products</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-emerald-600">
                  <AnimatedCounter
                    value={stats.categories}
                    duration={1000}
                  />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Categories</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-emerald-600">
                  <AnimatedCounter
                    value={stats.arReady}
                    suffix="%"
                    duration={1400}
                  />
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">AR Ready</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            <div className="animated-gradient-border">
              <div className="relative rounded-[14px] overflow-hidden shadow-2xl shadow-emerald-900/10">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt="AR furniture preview experience"
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950">
                    <Box className="h-20 w-20 text-emerald-500/30" />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Bottom info card */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass-card flex items-center gap-3 rounded-xl p-3 shadow-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                      <Smartphone className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Scan & View in AR</p>
                      <p className="text-xs text-muted-foreground">Point your phone at the QR code</p>
                    </div>
                    <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <QrCode className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements with glass effect */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -right-4 top-8 hidden glass-card rounded-xl p-3 shadow-lg lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold">3D Preview</p>
                  <p className="text-[10px] text-muted-foreground">Rotate & Zoom</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute -left-4 bottom-16 hidden glass-card rounded-xl p-3 shadow-lg lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold">360° View</p>
                  <p className="text-[10px] text-muted-foreground">Full rotation</p>
                </div>
              </div>
            </motion.div>

            {/* Top badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -right-2 bottom-32 hidden glass-card rounded-xl p-3 shadow-lg lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Box className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold">GLB Models</p>
                  <p className="text-[10px] text-muted-foreground">AR Ready</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
