'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

import { MobileBottomBar } from '@/components/layout/mobile-bottom-bar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden">
        <AppSidebar collapsed={sidebarCollapsed} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden mb-16 md:mb-0 print:mb-0 print:overflow-visible">
        <div className="print:hidden">
          <Topbar onToggleSidebar={() => setSidebarCollapsed((p) => !p)} />
        </div>
        <main className="flex-1 overflow-auto bg-muted/10 relative print:overflow-visible print:bg-white">
          <div className="flex flex-col min-h-full">{children}</div>
        </main>
      </div>
      <div className="print:hidden">
        <MobileBottomBar />
      </div>
    </div>
  );
}
