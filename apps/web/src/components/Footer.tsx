import Link from 'next/link';
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
    <footer className="bg-jodo-dark text-white mt-24">
      {/* CTA Banner */}
      <div className="bg-jodo-accent">
        <div className="section-container py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">Join the Jodo Family</p>
            <h3 className="text-white text-2xl lg:text-3xl font-bold">Get 10% off your first order</h3>
          </div>
          <form className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 md:w-72 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="bg-white text-jodo-accent font-semibold px-6 py-3 rounded-xl hover:bg-cream-100 transition-colors text-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" fill="#1c1a17" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight uppercase">Jodo</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Crafting comfort and shaping style. Premium furniture and home decor that transforms every space into a place you'll love.
            </p>
            <div className="space-y-2.5 text-sm text-white/60">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-jodo-accent shrink-0" />
                <span>123 Design Street, Mumbai, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-jodo-accent shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-jodo-accent shrink-0" />
                <span>hello@jodo.in</span>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-jodo-accent flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1 group"
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

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <p>© {new Date().getFullYear()} Jodo Home. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
