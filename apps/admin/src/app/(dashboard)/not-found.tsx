'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <LayoutDashboard className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Coming Soon</h2>
      <p className="text-muted-foreground max-w-[500px] mb-8">
        We haven't built this page yet! The sidebar contains all the planned routes for the Jodo Commerce OS, but we are building them out incrementally.
      </p>
      <Button asChild>
        <Link href="/">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
