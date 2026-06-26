'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={sidebarCollapsed} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarCollapsed((p) => !p)} />
        <main className="flex-1 overflow-auto bg-muted/10 relative">
          <div className="flex flex-col min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
