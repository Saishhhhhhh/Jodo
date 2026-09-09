'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building } from 'lucide-react';
import { ManufacturersTab } from '@/components/warehouse/tabs/manufacturers-tab';
import { AddManufacturerDrawer } from '@/components/warehouse/modals/add-manufacturer-drawer';

function ContractManufacturersPageContent() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Contract Manufacturers</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Contract Manufacturers</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Third-Party Production Facilities
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage partner garment and hardware manufacturers, evaluate capacity utilization, monitor average lead times, and track factory-specific QC pass rates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Manufacturer</span>
          </Button>
        </div>
      </div>

      <ManufacturersTab onOpenCreate={() => setIsAddOpen(true)} />

      <AddManufacturerDrawer open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

export default function ContractManufacturersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Manufacturers...</div>}>
      <ContractManufacturersPageContent />
    </Suspense>
  );
}
