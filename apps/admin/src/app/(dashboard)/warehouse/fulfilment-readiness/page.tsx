'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { FulfilmentTab } from '@/components/warehouse/tabs/fulfilment-tab';

function FulfilmentReadinessPageContent() {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Fulfilment Readiness</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Fulfilment Readiness</h1>
            <Badge variant="outline" className="text-xs font-mono">
              6-Gate Order Validation
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Validate whether sales orders can be safely fulfilled based on real-time inventory allocation, production run milestones, QC release, packaging, and carrier dispatch readiness.
          </p>
        </div>
      </div>

      <FulfilmentTab />
    </div>
  );
}

export default function FulfilmentReadinessPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Fulfilment Readiness...</div>}>
      <FulfilmentReadinessPageContent />
    </Suspense>
  );
}
