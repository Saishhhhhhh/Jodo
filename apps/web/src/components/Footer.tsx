'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

type FooterLinks = {
  [key: string]: { label: string; href: string }[];
};

const DEFAULT_FOOTER_LINKS: FooterLinks = {
  shop: [
    { label: 'Living Room', href: '/shop?category=living-room' },
    { label: 'Bedroom', href: '/shop?category=bedroom' },
    { label: 'Dining Room', href: '/shop?category=dining' },
    { label: 'Kitchen', href: '/shop?category=kitchen' },
    { label: 'Office', href: '/shop?category=study-office' },
    { label: 'Outdoor', href: '/shop?category=outdoor' },
  ],
  company: [
    { label: 'About JODO', href: '/about' },
    { label: 'Our Story', href: '/our-story' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  support: [
    { label: 'Help Centre', href: '/faqs' },
    { label: 'Track Order', href: '/account/orders' },
    { label: 'Warranty & Returns', href: '/faqs' },
    { label: 'Shipping Policy', href: '/faqs' },
    { label: 'Privacy Policy', href: '/faqs' },
  ],
};

const socials = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook' },
  { Icon: Twitter,   href: '#', label: 'Twitter' },
  { Icon: Youtube,   href: '#', label: 'YouTube' },
];

export default function Footer() {
  const [dynamicFooterLinks, setDynamicFooterLinks] = useState<FooterLinks>(DEFAULT_FOOTER_LINKS);

  useEffect(() => {
    const fetchFooterMenus = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const [shopRes, companyRes, supportRes] = await Promise.all([
          fetch(`${baseUrl}/api/storefront/navigation/footer-shop`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/api/storefront/navigation/footer-company`).then(r => r.ok ? r.json() : null),
          fetch(`${baseUrl}/api/storefront/navigation/footer-support`).then(r => r.ok ? r.json() : null)
        ]);

        const parseItems = (json: any) => (json?.data?.items || []).map((i: any) => ({ label: i.label, href: i.url }));

        const shopItems = shopRes ? parseItems(shopRes) : [];
        const companyItems = companyRes ? parseItems(companyRes) : [];
        const supportItems = supportRes ? parseItems(supportRes) : [];

        setDynamicFooterLinks({
          shop: shopItems.length > 0 ? shopItems : DEFAULT_FOOTER_LINKS.shop,
          company: companyItems.length > 0 ? companyItems : DEFAULT_FOOTER_LINKS.company,
          support: supportItems.length > 0 ? supportItems : DEFAULT_FOOTER_LINKS.support,
        });
      } catch (error) {
        // Fallback links already in place
      }
    };

    fetchFooterMenus();
  }, []);

  return (
    <div className="px-5 md:px-10 pb-5 md:pb-10 pt-[50px]">
      <footer className="bg-terracotta text-white rounded-[32px] overflow-hidden shadow-2xl">
        {/* 6.1 CTA Newsletter Banner */}
        <div className="bg-black/10">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">Be Part of the JODO Story</p>
              <h3 className="text-white text-xl lg:text-2xl font-bold">New drops, assembly tips, and early access delivered to you.</h3>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full md:w-auto mt-2 md:mt-0" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 w-full md:w-64 px-4 py-3 sm:py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-terracotta w-full sm:w-auto font-bold px-6 py-3 sm:py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm whitespace-nowrap shadow-md"
              >
                Join JODO
              </button>
            </form>
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">

            {/* 6.2 Brand column */}
            <div className="col-span-2 lg:col-span-2 space-y-3.5">
              <Link href="/" className="inline-block pb-1">
                <Image 
                  src="/logo.png" 
                  alt="JODO" 
                  width={180}
                  height={81}
                  className="h-[46px] md:h-[54px] w-auto object-contain brightness-0 invert opacity-95 transition-opacity hover:opacity-100" 
                />
              </Link>
              <p className="text-white/80 text-sm leading-relaxed max-w-xs font-medium">
                A new furniture experience. Tool-free assembly, flat-pack delivery, and in-house manufacturing bringing people and spaces together, one piece at a time.
              </p>
              <div className="space-y-2.5 text-sm text-white/80 font-medium">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-white shrink-0 opacity-80" />
                  <span>JODO HQ, Andheri West, Mumbai, Maharashtra 400053</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-white shrink-0 opacity-80" />
                  <span>+91 9004380874</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-white shrink-0 opacity-80" />
                  <span>hello@jodoshop.com</span>
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

            {/* 6.3 Link columns */}
            {Object.entries(dynamicFooterLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4 capitalize">
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

          {/* 6.4 Copyright */}
          <div className="mt-10 pt-6 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60 font-medium">
            <p>© 2026 JODO. All rights reserved.</p>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <p>
                Designed & Developed by{' '}
                <a 
                  href="https://digitalvigyapan.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:underline transition-all font-semibold"
                >
                  Digital Vigyapan
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

