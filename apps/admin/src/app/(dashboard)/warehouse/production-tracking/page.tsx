'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { ProductionTrackingTab } from '@/components/warehouse/tabs/production-tracking-tab';

function ProductionTrackingPageContent() {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Production Tracking</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Production Tracking</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Floor Pipeline Visibility
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time stage tracking across cutting, stitching, finishing and packaging gates. Monitor WIP batches and advance production runs.
          </p>
        </div>
      </div>

      <ProductionTrackingTab />
    </div>
  );
}

export default function ProductionTrackingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Production Tracking...</div>}>
      <ProductionTrackingPageContent />
    </Suspense>
  );
}
