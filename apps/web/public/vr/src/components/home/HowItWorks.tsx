'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { QrCode, Eye, Smartphone, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: QrCode,
    title: 'Scan QR Code',
    description: 'Point your phone camera at the product QR code to open the AR experience.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    glowColor: 'shadow-emerald-500/20',
    emoji: '📱',
  },
  {
    icon: Eye,
    title: 'View in 3D',
    description: 'Explore the product in full 3D. Rotate, zoom, and inspect every detail.',
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    glowColor: 'shadow-teal-500/20',
    emoji: '🔍',
  },
  {
    icon: Smartphone,
    title: 'Place in Your Room',
    description: 'Tap "View in My Room" to see the product in augmented reality.',
    color: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    glowColor: 'shadow-cyan-500/20',
    emoji: '🏠',
  },
  {
    icon: RotateCcw,
    title: 'Inspect & Decide',
    description: 'Walk around, check size, colors, and placement. Then enquire or buy.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    glowColor: 'shadow-amber-500/20',
    emoji: '✅',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 mb-4 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400">
              <Sparkles className="h-3 w-3" />
              Simple Process
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl text-balance"
          >
            How It{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Works
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-muted-foreground max-w-2xl mx-auto"
          >
            Four simple steps to experience products in your space
          </motion.p>
        </div>

        {/* Steps */}
        <div className="mt-12 relative">
          {/* Connecting dotted lines - desktop only */}
          <svg className="hidden lg:block absolute top-1/2 left-0 right-0 h-0 -translate-y-1/2 pointer-events-none z-0" aria-hidden="true">
            <line x1="12.5%" y1="0" x2="37.5%" y2="0" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="text-emerald-300 dark:text-emerald-700 opacity-50" />
            <line x1="37.5%" y1="0" x2="62.5%" y2="0" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="text-teal-300 dark:text-teal-700 opacity-50" />
            <line x1="62.5%" y1="0" x2="87.5%" y2="0" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" className="text-cyan-300 dark:text-cyan-700 opacity-50" />
          </svg>
          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <Card className={`card-shine h-full border-border/40 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xl hover:${step.glowColor} transition-all duration-300 group hover-lift ${index > 0 ? 'lg:ml-3' : ''}`}>
                  <CardContent className="p-6">
                    {/* Step number + icon with animated hover */}
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} border transition-all duration-300 group-hover:shadow-md group-hover:${step.glowColor}`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                          <Icon className="h-4.5 w-4.5 text-white" />
                        </div>
                      </motion.div>
                      <div className="flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/80 border border-border/40 text-xs font-bold text-foreground">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-5 text-base font-semibold group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                    {/* Step indicator dots */}
                    <div className="mt-4 flex gap-1.5">
                      {steps.map((_, dotIndex) => (
                        <div
                          key={dotIndex}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            dotIndex === index
                              ? `w-6 bg-gradient-to-r ${step.color} pulse-glow`
                              : 'w-1.5 bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Connecting arrow (desktop only, between cards) */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.1, type: 'spring', stiffness: 200 }}
                    className="absolute top-1/2 -right-1.5 z-20 hidden lg:flex items-center justify-center h-8 w-8 -translate-y-1/2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-emerald-200 dark:border-emerald-800 shadow-md">
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
    </section>
  );
}
