'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { AppSidebar } from './sidebar';

const BOTTOM_NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Customers', href: '/customers', icon: Users },
];

export function MobileBottomBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border z-50 flex items-center justify-around px-2 pb-safe">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', active && 'fill-primary/20')} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center w-full h-full gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 flex flex-col h-full border-r-0 sm:max-w-xs">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex-1 overflow-hidden">
             <AppSidebar collapsed={false} isMobile />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
