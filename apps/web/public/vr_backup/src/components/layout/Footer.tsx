'use client';

import { useAppStore } from '@/store/useAppStore';
import { Box, Mail, Phone, MapPin, Send, Check, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

const quickLinks = [
  { label: 'Home', view: 'home' as const },
  { label: 'Products', view: 'products' as const },
  { label: 'How It Works', scroll: 'how-it-works' },
];

const supportLinks = [
  { label: 'Contact Us', scroll: 'how-it-works' },
  { label: 'FAQ', scroll: 'how-it-works' },
  { label: 'AR Guide', scroll: 'how-it-works' },
];

const socialLinks = [
  {
    label: 'Twitter / X',
    href: '#',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'Instagram',
    href: '#',
    path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
  },
  {
    label: 'LinkedIn',
    href: '#',
    path: 'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
  },
  {
    label: 'YouTube',
    href: '#',
    path: 'M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.481.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z',
  },
];

export default function Footer() {
  const { navigateTo } = useAppStore();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNavClick = (view?: string, scroll?: string) => {
    if (view) {
      navigateTo(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (scroll) {
      navigateTo('home');
      setTimeout(() => {
        document.getElementById(scroll)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleSubscribe = async () => {
    if (!email) return;
    setIsSubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Successfully subscribed!');
        setIsSubscribed(true);
        setEmail('');
      } else {
        toast.error(data.error || 'Subscription failed');
      }
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="mt-auto border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                <Box className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                AR<span className="text-emerald-600">View</span>
              </span>
            </button>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Experience products in your space before you buy. Scan, view, and place AR-enabled products in your room.
            </p>
            {/* Social/contact info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-emerald-600" />
                <span>hello@arview.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="mt-3 space-y-2">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.view, link.scroll)}
                    className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="mt-3 space-y-2">
              {supportLinks.map(link => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.view, link.scroll)}
                    className="text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + AR Info */}
          <div>
            <h4 className="text-sm font-semibold">Stay Updated</h4>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get the latest AR products and features delivered to your inbox.
              </p>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    placeholder="your@email.com"
                    disabled={isSubscribed}
                    className="w-full rounded-lg border border-border/60 bg-background pl-8 pr-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 disabled:opacity-50 transition-all"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleSubscribe}
                  disabled={isSubscribing || isSubscribed || !email}
                  className={`h-auto px-3 shrink-0 ${
                    isSubscribed
                      ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700'
                  }`}
                >
                  {isSubscribing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isSubscribed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              {isSubscribed && (
                <p className="text-[10px] text-emerald-600 font-medium">✓ You&apos;re subscribed!</p>
              )}
            </div>

            {/* AR Requirements */}
            <div className="mt-5">
              <h4 className="text-sm font-semibold">AR Requirements</h4>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Android: Chrome with ARCore
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                  iOS: Safari with ARKit
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
                  Stable internet connection
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ARView. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-background text-muted-foreground transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 hover:scale-110 hover:shadow-md hover:shadow-emerald-500/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="transition-transform"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-border">|</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            <span className="text-border">|</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
