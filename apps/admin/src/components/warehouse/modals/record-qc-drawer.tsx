'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWarehouseStore, QualityCheckItem } from '@/stores/warehouse';
import { toast } from 'sonner';

interface RecordQCDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQC?: QualityCheckItem | null;
}

export function RecordQCDrawer({ open, onOpenChange, selectedQC }: RecordQCDrawerProps) {
  const { qualityChecks, recordQC } = useWarehouseStore();

  const [qcId, setQcId] = useState('');
  const [passed, setPassed] = useState('0');
  const [failed, setFailed] = useState('0');
  const [damaged, setDamaged] = useState('0');
  const [inspector, setInspector] = useState('Rahul Sharma');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedQC) {
      setQcId(selectedQC.id);
      setPassed(selectedQC.passed.toString());
      setFailed(selectedQC.failed.toString());
      setDamaged(selectedQC.damaged.toString());
      setInspector(selectedQC.inspector || 'Rahul Sharma');
      setNotes(selectedQC.notes || '');
    } else if (qualityChecks.length > 0) {
      const first = qualityChecks[0];
      setQcId(first.id);
      setPassed(first.passed.toString());
      setFailed(first.failed.toString());
      setDamaged(first.damaged.toString());
      setInspector(first.inspector || 'Rahul Sharma');
      setNotes(first.notes || '');
    }
  }, [selectedQC, qualityChecks, open]);

  const currentItem = qualityChecks.find((q) => q.id === qcId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcId) {
      toast.error('Please select an inspection record');
      return;
    }

    recordQC({
      qcId,
      passed: parseInt(passed, 10) || 0,
      failed: parseInt(failed, 10) || 0,
      damaged: parseInt(damaged, 10) || 0,
      inspector,
      notes,
    });

    toast.success('Quality check recorded and inventory updated');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Record Quality Inspection</SheetTitle>
          <SheetDescription>
            Inspect batch quality, record passed/failed units, and credit approved items to inventory.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="qc-select">Select Inspection Batch *</Label>
            <Select value={qcId} onValueChange={setQcId}>
              <SelectTrigger id="qc-select">
                <SelectValue placeholder="Choose QC record" />
              </SelectTrigger>
              <SelectContent>
                {qualityChecks.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.id} — {q.product} ({q.received} units)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentItem && (
            <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1 border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-semibold text-foreground">{currentItem.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Production Order:</span>
                <span className="font-mono">{currentItem.productionOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manufacturer:</span>
                <span>{currentItem.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Received:</span>
                <span className="font-bold">{currentItem.received} units</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="qc-passed" className="text-green-600 dark:text-green-400">Passed *</Label>
              <Input
                id="qc-passed"
                type="number"
                min="0"
                value={passed}
                onChange={(e) => setPassed(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qc-failed" className="text-amber-600 dark:text-amber-400">Failed</Label>
              <Input
                id="qc-failed"
                type="number"
                min="0"
                value={failed}
                onChange={(e) => setFailed(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qc-damaged" className="text-destructive">Damaged</Label>
              <Input
                id="qc-damaged"
                type="number"
                min="0"
                value={damaged}
                onChange={(e) => setDamaged(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-inspector">Inspector Name *</Label>
            <Input
              id="qc-inspector"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-notes">Inspection Observations & Findings</Label>
            <Textarea
              id="qc-notes"
              placeholder="e.g. Seam stitching tension verified. Color fastness approved against Pantone standards."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit QC Report</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
