'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

import { MobileBottomBar } from '@/components/layout/mobile-bottom-bar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden mb-16 md:mb-0">
        <Topbar onToggleSidebar={() => setSidebarCollapsed((p) => !p)} />
        <main className="flex-1 overflow-auto bg-muted/10 relative">
          <div className="flex flex-col min-h-full">{children}</div>
        </main>
      </div>
      <MobileBottomBar />
    </div>
  );
}
