'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ClipboardCheck } from 'lucide-react';
import { QualityChecksTab } from '@/components/warehouse/tabs/quality-checks-tab';
import { RecordQCDrawer } from '@/components/warehouse/modals/record-qc-drawer';
import { QualityCheckItem } from '@/stores/warehouse';

function QualityChecksPageContent() {
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState<QualityCheckItem | null>(null);

  const handleOpenRecordQC = (item?: QualityCheckItem) => {
    setSelectedQC(item || null);
    setIsRecordOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/warehouse" className="hover:text-foreground transition-colors">
              Warehouse
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Quality Checks</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Quality Checks</h1>
            <Badge variant="outline" className="text-xs font-mono">
              Tolerance & Batch Verification
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Inspect production batches against strict tolerance standards, verify 7 checkpoint parameters, and release approved stock into active inventory.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => handleOpenRecordQC()} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Record Inspection</span>
          </Button>
        </div>
      </div>

      <QualityChecksTab onOpenRecordQC={handleOpenRecordQC} />

      <RecordQCDrawer
        open={isRecordOpen}
        onOpenChange={setIsRecordOpen}
        selectedQC={selectedQC}
      />
    </div>
  );
}

export default function QualityChecksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Quality Checks...</div>}>
      <QualityChecksPageContent />
    </Suspense>
  );
}
