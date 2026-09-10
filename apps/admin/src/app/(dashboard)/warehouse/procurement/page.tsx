'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowLeft, Truck } from 'lucide-react';
import { ProcurementTab } from '@/components/warehouse/tabs/procurement-tab';
import { CreateProcurementDrawer } from '@/components/warehouse/modals/create-procurement-drawer';

function ProcurementPageContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Procurement</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Purchase Orders & Procurement</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Inbound Material Supply
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage fabric, hardware and raw material purchase orders, track supplier deliveries, and receive inventory directly at warehouse docks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </Button>
        </div>
      </div>

      <ProcurementTab onOpenCreate={() => setIsCreateOpen(true)} />

      <CreateProcurementDrawer open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}

export default function ProcurementPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Procurement...</div>}>
      <ProcurementPageContent />
    </Suspense>
  );
}
