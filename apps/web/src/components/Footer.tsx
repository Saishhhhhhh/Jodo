import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: 'Living Room', href: '/shop/living-room' },
    { label: 'Bedroom', href: '/shop/bedroom' },
    { label: 'Dining Room', href: '/shop/dining-room' },
    { label: 'Kitchen', href: '/shop/kitchen' },
    { label: 'Office', href: '/shop/office' },
    { label: 'Outdoor', href: '/shop/outdoor' },
  ],
  company: [
    { label: 'About Jodo', href: '/about' },
    { label: 'Our Story', href: '/about#story' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Track Order', href: '/track' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

const socials = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook' },
  { Icon: Twitter,   href: '#', label: 'Twitter' },
  { Icon: Youtube,   href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <div className="px-5 md:px-10 pb-5 md:pb-10 pt-[50px]">
      <footer className="bg-terracotta text-white rounded-[32px] overflow-hidden shadow-2xl">
        {/* CTA Banner */}
        <div className="bg-black/10">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">Join the Jodo Family</p>
              <h3 className="text-white text-xl lg:text-2xl font-bold">Get 10% off your first order</h3>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-terracotta font-bold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm whitespace-nowrap shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">

            {/* Brand column */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="inline-block relative w-[180px] h-[50px] md:w-[220px] md:h-[60px] -ml-4">
              <Image 
                src="/logo.png" 
                alt="Jodo" 
                fill 
                className="object-cover object-center brightness-0 invert drop-shadow-sm scale-[1.5]" 
              />
            </Link>
              <p className="text-white/80 text-sm leading-relaxed max-w-xs font-medium">
                Crafting comfort and shaping style. Premium furniture and home decor that transforms every space into a place you&apos;ll love.
              </p>
              <div className="space-y-2.5 text-sm text-white/80 font-medium">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-white shrink-0 opacity-80" />
                  <span>123 Design Street, Mumbai, India</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-white shrink-0 opacity-80" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-white shrink-0 opacity-80" />
                  <span>hello@jodo.in</span>
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
                  {section}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white hover:text-white/70 font-medium transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60 font-medium">
            <p>© {new Date().getFullYear()} Jodo Home. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
