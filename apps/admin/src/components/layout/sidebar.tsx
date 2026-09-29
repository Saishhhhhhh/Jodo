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
  HelpCircle,
  Target,
  CheckSquare,
  User,
  Copy,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Warehouse,
  Factory,
  ClipboardCheck,
  Sparkles,
  BookOpen,
  FileEdit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import { getImageUrl, apiClient } from '@/lib/api-client';
import { useEffect } from 'react';

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
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
      { label: 'Returns & Complaints', href: '/returns', icon: RotateCcw },
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
    label: 'Tasks',
    icon: CheckSquare,
    children: [
      { label: 'Dashboard', href: '/tasks', icon: LayoutDashboard },
      { label: 'Tasks', href: '/tasks/my-tasks', icon: User },
      { label: 'All Tasks', href: '/tasks/all-tasks', icon: FileText },
      { label: 'Team Tasks', href: '/tasks/team-tasks', icon: Users },
      { label: 'Overdue', href: '/tasks/overdue', icon: AlertTriangle },
      { label: 'Completed', href: '/tasks/completed', icon: CheckCircle },
      { label: 'Templates', href: '/tasks/templates', icon: Copy },
      { label: 'Reports', href: '/tasks/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'CRM / Leads',
    icon: Target,
    href: '/leads',
  },
  {
    label: 'Reports & Digest',
    icon: BarChart2,
    href: '/reports',
  },
  {
    label: 'Warehouse',
    href: '/warehouse',
    icon: Warehouse,
    children: [
      { label: 'Dashboard', href: '/warehouse', icon: LayoutDashboard },
      { label: 'Procurement', href: '/warehouse/procurement', icon: Truck },
      { label: 'Contract Manufacturers', href: '/warehouse/contract-manufacturers', icon: Building },
      { label: 'Production Orders', href: '/warehouse/production-orders', icon: Factory },
      { label: 'Production Tracking', href: '/warehouse/production-tracking', icon: Activity },
      { label: 'Delays & Issues', href: '/warehouse/delays-issues', icon: AlertTriangle },
      { label: 'Quality Checks', href: '/warehouse/quality-checks', icon: ClipboardCheck },
      { label: 'Stock-in-Hand', href: '/warehouse/stock-in-hand', icon: Package },
      { label: 'Fulfilment Readiness', href: '/warehouse/fulfilment-readiness', icon: CheckSquare },
    ],
  },
  {
    label: 'AI Content',
    icon: Sparkles,
    badge: 'AI',
    children: [
      { label: 'Dashboard', href: '/ai-content', icon: LayoutDashboard },
      { label: 'Product Descriptions', href: '/ai-content/product-descriptions', icon: FileEdit },
      { label: 'Catalogue Content', href: '/ai-content/catalogue-content', icon: BookOpen },
      { label: 'Listing Copy', href: '/ai-content/listing-copy', icon: ShoppingBag },
      { label: 'Campaign Content', href: '/ai-content/campaign-content', icon: Megaphone },
      { label: 'Drafts', href: '/ai-content/drafts', icon: Copy },
      { label: 'Review & Approval', href: '/ai-content/review-approval', icon: ClipboardCheck },
      { label: 'Published Content', href: '/ai-content/published', icon: CheckCircle },
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
    label: 'WhatsApp',
    href: '/whatsapp',
    icon: MessageSquare,
  },
  {
    label: 'Content',
    icon: FileText,
    children: [
      { label: 'Banners', href: '/banners', icon: ImageIcon },
      { label: 'Media Library', href: '/media', icon: ImageIcon },
      { label: 'Navigation', href: '/navigation', icon: Navigation },

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
      { label: 'Policies', href: '/settings/policies', icon: FileCheck },
      { label: 'Audit Logs', href: '/settings/audit-logs', icon: Activity },
    ],
  },
  {
    label: 'Help & Docs',
    href: '/help',
    icon: HelpCircle,
  },
];

interface SidebarProps {
  collapsed: boolean;
  isMobile?: boolean;
}

export function AppSidebar({ collapsed, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [openGroups, setOpenGroups] = useState<string[]>(['Store', 'Orders', 'Warehouse', 'AI Content']);
  const [counts, setCounts] = useState<any>({});

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const { data } = await apiClient.get('/admin/counts');
        if (data?.success && isMounted) {
          setCounts(data.data);
        }
      } catch (err) {
        console.error('Error fetching admin counts', err);
      }
    };
    fetchCounts();
    // Poll every 5 seconds for real-time order & notification counter updates
    const interval = setInterval(fetchCounts, 5000);
    window.addEventListener('focus', fetchCounts);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', fetchCounts);
    };
  }, []);

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

  const isTeamMember = user?.roles?.includes('TEAM_MEMBER');

  const visibleNavItems = React.useMemo<NavItem[]>(() => {
    if (!isTeamMember) {
      // Super Admin / Regular Admin: Add 'Team Members' to the Tasks children
      const nav = [...NAV_ITEMS];
      const tasksIndex = nav.findIndex(n => n.label === 'Tasks');
      if (tasksIndex !== -1) {
        // Clone the tasks section to modify it
        const tasksSection = { ...nav[tasksIndex], children: [...(nav[tasksIndex].children || [])] };
        
        // Add Team Members if it doesn't exist
        if (!tasksSection.children.some(c => c.label === 'Team Members')) {
          tasksSection.children.splice(4, 0, { label: 'Team Members', href: '/tasks/team-members', icon: Users2 });
        }
        nav[tasksIndex] = tasksSection;
      }
      return nav;
    }

    // Team Member: Only show a subset of Tasks
    return [
      {
        label: 'Tasks',
        icon: CheckSquare,
        children: [
          { label: 'Tasks', href: '/tasks/my-tasks', icon: User },
          { label: 'Completed', href: '/tasks/completed', icon: CheckCircle },
        ],
      }
    ];
  }, [isTeamMember]);

  function isGroupActive(item: NavItem) {
    return item.children?.some((child) => child.href && isActive(child.href));
  }

  // Auto-expand active group when route changes
  useEffect(() => {
    visibleNavItems.forEach((item) => {
      if (item.children?.some((child) => child.href && isActive(child.href))) {
        setOpenGroups((prev) => (prev.includes(item.label) ? prev : [...prev, item.label]));
      }
    });
  }, [bestMatch, visibleNavItems]);

  function getBadgeForLabel(label: string): number {
    switch (label) {
      case 'Notifications':
        return counts?.notifications?.unread || 0;
      case 'Store':
        return (
          (counts?.products?.requiresAction || 0) +
          (counts?.inventory?.lowStock || 0) +
          (counts?.inventory?.outOfStock || 0) +
          (counts?.reviews?.pending || 0)
        );
      case 'Products':
        return counts?.products?.requiresAction || 0;
      case 'Inventory':
        return (counts?.inventory?.lowStock || 0) + (counts?.inventory?.outOfStock || 0);
      case 'Product Reviews':
        return counts?.reviews?.pending || 0;
      case 'Orders':
        return counts?.orders?.pending || 0;
      case 'All Orders':
        return counts?.orders?.pending || 0;
      case 'Draft Orders':
        return counts?.orders?.draft || 0;
      case 'Shipping Labels':
        return counts?.orders?.shippingPending || 0;
      case 'Returns & Complaints':
        return counts?.returns?.open || 0;
      case 'Fraud Review':
        return counts?.orders?.fraudReview || 0;
      case 'Tasks':
        return counts?.tasks?.totalOpen || 0;
      case 'Overdue':
        return counts?.tasks?.overdue || 0;
      case 'Messages':
        return counts?.messages?.unread || 0;
      default:
        return 0;
    }
  }

  function NotificationBadge({ count }: { count: number }) {
    if (!count || count <= 0) return null;
    return (
      <Badge
        variant="default"
        className="h-4 min-w-4 px-1 py-0 rounded-full text-[9px] font-bold leading-none tabular-nums inline-flex items-center justify-center shrink-0 border-0 select-none shadow-xs pointer-events-none"
      >
        {count > 99 ? '99+' : count}
      </Badge>
    );
  }

  function CollapsedStatusPoint({ count }: { count: number }) {
    if (!count || count <= 0) return null;
    return (
      <span className="absolute top-1 right-1 flex h-2 w-2 pointer-events-none">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary ring-2 ring-sidebar" />
      </span>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          collapsed ? 'w-14' : 'w-60',
          !isMobile && 'hidden md:flex'
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
            <Link href="/" className="flex items-center">
              <img
                src={(user as any)?.adminLogoUrl ? getImageUrl((user as any).adminLogoUrl) : "/logo.png"}
                alt="Jodo"
                className="h-10 w-auto max-w-[190px] object-contain"
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          <nav className="flex flex-col gap-1.5 p-3">
            {visibleNavItems.map((item, index) => {
              if (!item.children) {
                // Top-level link (Dashboard)
                const active = item.href ? isActive(item.href) : false;
                const badgeCount = getBadgeForLabel(item.label);
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
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && <NotificationBadge count={badgeCount} />}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.label}>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          {NavLink}
                          <CollapsedStatusPoint count={badgeCount} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-2">
                        <span>{item.label}</span>
                        {badgeCount > 0 && <NotificationBadge count={badgeCount} />}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return <div key={item.label}>{NavLink}</div>;
              }

              // Group with children
              const groupActive = isGroupActive(item);
              const isOpen = openGroups.includes(item.label);
              const groupBadgeCount = getBadgeForLabel(item.label);

              if (collapsed) {
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center justify-center w-full rounded-md p-2 transition-all duration-150',
                              groupActive
                                ? 'bg-sidebar-accent text-primary'
                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </Link>
                        ) : (
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
                        )}
                        <CollapsedStatusPoint count={groupBadgeCount} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1 p-2">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                          {item.label}
                        </span>
                        <NotificationBadge count={groupBadgeCount} />
                      </div>
                      {item.children?.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href!}
                          className="flex items-center justify-between gap-3 text-sm hover:text-primary transition-colors py-0.5"
                        >
                          <div className="flex items-center gap-2">
                            <child.icon className="h-3.5 w-3.5" />
                            <span>{child.label}</span>
                          </div>
                          <NotificationBadge count={getBadgeForLabel(child.label)} />
                        </Link>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <div key={item.label}>
                  <div
                    className={cn(
                      'flex items-center w-full rounded-md text-sm font-medium transition-all duration-150',
                      groupActive
                        ? 'text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/40'
                    )}
                  >
                    {item.href ? (
                      <div className="flex items-center w-full px-2.5 py-2">
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (!openGroups.includes(item.label)) {
                              setOpenGroups((prev) => [...prev, item.label]);
                            }
                          }}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <item.icon
                            className={cn(
                              'shrink-0 h-4 w-4',
                              groupActive ? 'text-primary' : 'text-sidebar-foreground/50'
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroup(item.label);
                          }}
                          className="p-0.5 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors mr-2"
                          aria-label="Toggle submenu"
                        >
                          {isOpen ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <NotificationBadge count={getBadgeForLabel(item.label)} />
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleGroup(item.label)}
                        className="flex items-center w-full px-2.5 py-2 text-left"
                      >
                        <item.icon
                          className={cn(
                            'shrink-0 h-4 w-4',
                            groupActive ? 'text-primary' : 'text-sidebar-foreground/50'
                          )}
                        />
                        <span className="flex-1 truncate ml-3">{item.label}</span>
                        <span className="text-sidebar-foreground/40 transition-colors mr-2">
                          {isOpen ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                        <NotificationBadge count={getBadgeForLabel(item.label)} />
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="ml-3 mt-0.5 pl-3.5 border-l border-sidebar-border/60 space-y-0.5">
                      {item.children.map((child) => {
                        const childActive = child.href ? isActive(child.href) : false;
                        return (
                          <Link
                            key={child.label}
                            href={child.href!}
                            className={cn(
                              'flex items-center justify-between gap-2 rounded-md pl-2 pr-2.5 py-1.5 text-[0.8125rem] transition-all duration-150',
                              childActive
                                ? 'text-primary font-medium bg-primary/8'
                                : 'text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <child.icon className={cn('h-3.5 w-3.5 shrink-0', childActive && 'text-primary')} />
                              <span className="truncate">{child.label}</span>
                            </div>
                            <NotificationBadge count={getBadgeForLabel(child.label)} />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

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
