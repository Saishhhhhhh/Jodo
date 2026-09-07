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
  const { qualityChecks, recordQualityCheck } = useWarehouseStore();

  const [qcId, setQcId] = useState('');
  const [passed, setPassed] = useState('0');
  const [failed, setFailed] = useState('0');
  const [inspector, setInspector] = useState('Rahul Sharma');
  const [defectType, setDefectType] = useState<QualityCheckItem['defectType']>('None');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedQC) {
      setQcId(selectedQC.id);
      setPassed(selectedQC.passedQuantity.toString());
      setFailed(selectedQC.failedQuantity.toString());
      setInspector(selectedQC.inspector || 'Rahul Sharma');
      setDefectType(selectedQC.defectType || 'None');
      setNotes(selectedQC.defectNotes || '');
    } else if (qualityChecks.length > 0) {
      const first = qualityChecks[0];
      setQcId(first.id);
      setPassed(first.passedQuantity.toString());
      setFailed(first.failedQuantity.toString());
      setInspector(first.inspector || 'Rahul Sharma');
      setDefectType(first.defectType || 'None');
      setNotes(first.defectNotes || '');
    }
  }, [selectedQC, qualityChecks, open]);

  const currentItem = qualityChecks.find((q) => q.id === qcId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcId) {
      toast.error('Please select an inspection record');
      return;
    }

    const pQty = parseInt(passed, 10) || 0;
    const fQty = parseInt(failed, 10) || 0;

    recordQualityCheck({
      qcId,
      passedQuantity: pQty,
      failedQuantity: fQty,
      inspector,
      defectType,
      defectNotes: notes,
    });

    toast.success(
      `Quality inspection recorded. ${pQty} approved units credited to stock. ${fQty} failed units quarantined.`
    );
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Record Quality Inspection</SheetTitle>
          <SheetDescription>
            Inspect batch quality against tolerance standards. Only QC-approved units will move into sellable stock.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="qc-select">Inspection Batch *</Label>
            <Select value={qcId} onValueChange={setQcId}>
              <SelectTrigger id="qc-select">
                <SelectValue placeholder="Choose QC record" />
              </SelectTrigger>
              <SelectContent>
                {qualityChecks.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.id} — {q.product} ({q.batchNumber})
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
                <span className="text-muted-foreground">Batch Number:</span>
                <span className="font-mono">{currentItem.batchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Production Order:</span>
                <span className="font-mono">{currentItem.productionOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manufacturer:</span>
                <span>{currentItem.manufacturer}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t text-foreground">
                <span>Quantity to Inspect:</span>
                <span>{currentItem.quantityInspected} units</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qc-passed" className="text-green-600 dark:text-green-400">
                Passed Quantity *
              </Label>
              <Input
                id="qc-passed"
                type="number"
                min="0"
                value={passed}
                onChange={(e) => setPassed(e.target.value)}
                required
              />
              <p className="text-[10px] text-muted-foreground">Will move to available stock</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qc-failed" className="text-destructive">
                Failed Quantity
              </Label>
              <Input
                id="qc-failed"
                type="number"
                min="0"
                value={failed}
                onChange={(e) => setFailed(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Quarantined from inventory</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-defect-type">Defect Classification</Label>
            <Select value={defectType} onValueChange={(val: any) => setDefectType(val)}>
              <SelectTrigger id="qc-defect-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None (Zero Defect)</SelectItem>
                <SelectItem value="Stitching & Seam">Stitching & Seam</SelectItem>
                <SelectItem value="Color Mismatch">Color Mismatch / Shading</SelectItem>
                <SelectItem value="Sizing & Dimensions">Sizing & Dimensions</SelectItem>
                <SelectItem value="Fabric Flaw">Fabric Flaw / Pilling</SelectItem>
                <SelectItem value="Hardware Issue">Hardware Issue (Zipper/Buttons)</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="qc-notes">Defect Notes & Observations</Label>
            <Textarea
              id="qc-notes"
              placeholder="e.g. 40 units failed due to double-needle hem skipping on waistband."
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
