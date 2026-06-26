'use client';

import { LayoutDashboard } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <LayoutDashboard className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Page in Maintenance</h2>
      <p className="text-muted-foreground max-w-[500px]">
        We are currently building out this feature. Please check back later.
      </p>
    </div>
  );
}
