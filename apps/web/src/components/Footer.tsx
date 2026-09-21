import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

// We will fetch these dynamically in the component
type FooterLinks = {
  [key: string]: { label: string; href: string }[];
};

const socials = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook' },
  { Icon: Twitter,   href: '#', label: 'Twitter' },
  { Icon: Youtube,   href: '#', label: 'YouTube' },
];

export default async function Footer() {
  let dynamicFooterLinks: FooterLinks = {};

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const [shopRes, companyRes, supportRes] = await Promise.all([
      fetch(`${baseUrl}/api/storefront/navigation/footer-shop`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/storefront/navigation/footer-company`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/storefront/navigation/footer-support`, { next: { revalidate: 60 } })
    ]);

    const parseItems = async (res: Response) => {
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data?.items || []).map((i: any) => ({ label: i.label, href: i.url }));
    };

    dynamicFooterLinks = {
      shop: await parseItems(shopRes),
      company: await parseItems(companyRes),
      support: await parseItems(supportRes),
    };
  } catch (error) {
    console.error('Failed to fetch footer menus:', error);
  }

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
            <form className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full md:w-auto mt-2 md:mt-0">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 w-full md:w-64 px-4 py-3 sm:py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="bg-white text-terracotta w-full sm:w-auto font-bold px-6 py-3 sm:py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm whitespace-nowrap shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">

            {/* Brand column */}
            <div className="col-span-2 lg:col-span-2 space-y-3.5">
              <Link href="/" className="inline-block pb-1">
                <Image 
                  src="/logo.png" 
                  alt="Jodo" 
                  width={150}
                  height={45}
                  className="h-[38px] md:h-[42px] w-auto object-contain brightness-0 invert opacity-95 transition-opacity hover:opacity-100" 
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
            {Object.entries(dynamicFooterLinks).map(([section, links]) => (
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
