'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Factory } from 'lucide-react';
import { ProductionOrdersTab } from '@/components/warehouse/tabs/production-orders-tab';
import { CreateProductionOrderDrawer } from '@/components/warehouse/modals/create-production-order-drawer';
import { RecordQCDrawer } from '@/components/warehouse/modals/record-qc-drawer';

function ProductionOrdersPageContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQCOpen, setIsQCOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Production Orders</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Production Orders</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Manufacturing Floor Orders
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create and track production runs with contract manufacturing partners, track output completion progress, and push finished batches to Quality Inspection.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Production Order</span>
          </Button>
        </div>
      </div>

      <ProductionOrdersTab
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenQC={() => setIsQCOpen(true)}
      />

      <CreateProductionOrderDrawer open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <RecordQCDrawer open={isQCOpen} onOpenChange={setIsQCOpen} />
    </div>
  );
}

export default function ProductionOrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Production Orders...</div>}>
      <ProductionOrdersPageContent />
    </Suspense>
  );
}
