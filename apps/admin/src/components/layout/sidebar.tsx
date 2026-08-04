'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  FileText,
  Megaphone,
  BarChart3,
  Puzzle,
  Settings,
  Store,
  ChevronDown,
  ChevronRight,
  Boxes,
  ReceiptText,
  RotateCcw,
  Truck,
  ShieldAlert,
  Users2,
  Star,
  Wallet,
  Mail,
  MessageSquare,
  Bell,
  Globe,
  Image as ImageIcon,
  Navigation,
  CreditCard,
  ShoppingBag,
  Building,
  LineChart,
  Search,
  GitBranch,
  Key,
  Webhook,
  Code2,
  MapPin,
  Languages,
  FileCheck,
  Receipt,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Store',
    icon: Store,
    children: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Collections', href: '/collections', icon: Boxes },
      { label: 'Inventory', href: '/inventory', icon: ReceiptText },
      { label: 'Gift Cards', href: '/gift-cards', icon: Tag },
      { label: 'Product Reviews', href: '/reviews', icon: Star },
    ],
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    children: [
      { label: 'All Orders', href: '/orders', icon: ShoppingCart },
      { label: 'Draft Orders', href: '/orders/draft', icon: FileText },
      { label: 'Returns', href: '/returns', icon: RotateCcw },
      { label: 'Shipping Labels', href: '/shipping-labels', icon: Truck },
      { label: 'Fraud Review', href: '/fraud', icon: ShieldAlert },
    ],
  },
  {
    label: 'Customers',
    icon: Users,
    children: [
      { label: 'All Customers', href: '/customers', icon: Users },
      { label: 'Segments', href: '/customers/segments', icon: Users2 },
      { label: 'Loyalty', href: '/customers/loyalty', icon: Star },
      { label: 'Wallets', href: '/customers/wallets', icon: Wallet },
    ],
  },
  {
    label: 'Marketing',
    icon: Megaphone,
    children: [
      { label: 'Discounts', href: '/discounts', icon: Tag },
      { label: 'Campaigns', href: '/campaigns', icon: Megaphone },
      { label: 'Email', href: '/marketing/email', icon: Mail },
    ],
  },
  {
    label: 'Content',
    icon: FileText,
    children: [
      { label: 'Banners', href: '/banners', icon: ImageIcon },
      { label: 'Media Library', href: '/media', icon: ImageIcon },
      { label: 'Navigation', href: '/navigation', icon: Navigation },
      { label: 'Blog', href: '/blog', icon: FileText },
    ],
  },

  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Overview', href: '/analytics', icon: BarChart3 },
      { label: 'Sales', href: '/analytics/sales', icon: LineChart },
      { label: 'Products', href: '/analytics/products', icon: Package },
      { label: 'Customers', href: '/analytics/customers', icon: Users },
      { label: 'Checkout Funnel', href: '/analytics/funnel', icon: GitBranch },
      { label: 'Reports', href: '/analytics/reports', icon: FileText },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Store Details', href: '/settings', icon: Store },
      { label: 'Staff & Permissions', href: '/settings/staff', icon: Users },
      { label: 'Payments', href: '/settings/payments', icon: CreditCard },
      { label: 'Shipping', href: '/settings/shipping', icon: Truck },
      { label: 'Taxes', href: '/settings/taxes', icon: Receipt },
      { label: 'Locations', href: '/settings/locations', icon: MapPin },
      { label: 'Languages', href: '/settings/languages', icon: Languages },
      { label: 'Policies', href: '/settings/policies', icon: FileCheck },
      { label: 'Webhooks', href: '/apps/webhooks', icon: Webhook },
      { label: 'Audit Logs', href: '/settings/audit-logs', icon: Activity },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
}

export function AppSidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['Store', 'Orders']);

  function toggleGroup(label: string) {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  }

  const allHrefs = React.useMemo(() => {
    const hrefs: string[] = [];
    NAV_ITEMS.forEach((item) => {
      if (item.href) hrefs.push(item.href);
      item.children?.forEach((child) => {
        if (child.href) hrefs.push(child.href);
      });
    });
    return hrefs;
  }, []);

  const bestMatch = React.useMemo(() => {
    return allHrefs.reduce((best, href) => {
      if (pathname === href || pathname.startsWith(`${href}/`)) {
        if (!best || href.length > best.length) {
          return href;
        }
      }
      return best;
    }, '');
  }, [pathname, allHrefs]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return href === bestMatch;
  }

  function isGroupActive(item: NavItem) {
    return item.children?.some((child) => child.href && isActive(child.href));
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          collapsed ? 'w-14' : 'w-60'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center h-14 border-b border-sidebar-border px-4 shrink-0',
            collapsed ? 'justify-center' : ''
          )}
        >
          {collapsed ? (
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.4)]">
              <Store className="w-4 h-4 text-primary-foreground" />
            </div>
          ) : (
            <div className="relative w-[160px] h-[50px] flex items-center justify-start -ml-2">
              <Image
                src="/logo.png"
                alt="Jodo"
                width={200}
                height={60}
                className="w-full h-auto object-contain object-left origin-left scale-[1.25]"
                priority
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          <nav className="px-2 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              if (!item.children) {
                // Top-level link (Dashboard)
                const active = item.href ? isActive(item.href) : false;
                const NavLink = (
                  <Link
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'shrink-0 h-4 w-4',
                        active ? 'text-primary' : 'text-sidebar-foreground/60'
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }
                return <div key={item.label}>{NavLink}</div>;
              }

              // Group with children
              const groupActive = isGroupActive(item);
              const isOpen = openGroups.includes(item.label) || !!groupActive;

              if (collapsed) {
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'flex items-center justify-center w-full rounded-md p-2 transition-all duration-150',
                          groupActive
                            ? 'bg-sidebar-accent text-primary'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1 p-2">
                      <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {item.label}
                      </span>
                      {item.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href!}
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors py-0.5"
                        >
                          <child.icon className="h-3.5 w-3.5" />
                          {child.label}
                        </Link>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      'flex items-center gap-3 w-full rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150',
                      groupActive
                        ? 'text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/40'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'shrink-0 h-4 w-4',
                        groupActive ? 'text-primary' : 'text-sidebar-foreground/50'
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/40" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="ml-3 mt-0.5 pl-3.5 border-l border-sidebar-border/60 space-y-0.5">
                      {item.children.map((child) => {
                        const childActive = child.href ? isActive(child.href) : false;
                        return (
                          <Link
                            key={child.label}
                            href={child.href!}
                            className={cn(
                              'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[0.8125rem] transition-all duration-150',
                              childActive
                                ? 'text-primary font-medium bg-primary/8'
                                : 'text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50'
                            )}
                          >
                            <child.icon className={cn('h-3.5 w-3.5 shrink-0', childActive && 'text-primary')} />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom */}
        {!collapsed && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
              <p className="text-xs font-semibold text-primary">Jodo Commerce OS</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">v0.1.0 — Phase 0</p>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
