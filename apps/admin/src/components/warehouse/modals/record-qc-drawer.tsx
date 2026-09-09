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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertCircle, Upload, Check, X, Minus } from 'lucide-react';
import { useWarehouseStore, QualityCheckItem } from '@/stores/warehouse';
import { toast } from 'sonner';

interface RecordQCDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQC?: QualityCheckItem | null;
}

const CHECKPOINTS = [
  'Stitching Quality',
  'Color Accuracy',
  'Sizing Tolerance',
  'Fabric Defects',
  'Label Correctness',
  'Packaging Quality',
  'Barcode Readability',
] as const;

type CheckpointStatus = 'Pass' | 'Fail' | 'NA';

export function RecordQCDrawer({ open, onOpenChange, selectedQC }: RecordQCDrawerProps) {
  const { qualityChecks, recordQualityCheck } = useWarehouseStore();

  const [qcId, setQcId] = useState('');
  const [passed, setPassed] = useState('0');
  const [failed, setFailed] = useState('0');
  const [inspector, setInspector] = useState('Rahul Sharma');
  const [defectType, setDefectType] = useState<QualityCheckItem['defectType']>('None');
  const [defectDescription, setDefectDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [inspectionDate, setInspectionDate] = useState(
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [checkpoints, setCheckpoints] = useState<Record<string, CheckpointStatus>>(() => {
    const initial: Record<string, CheckpointStatus> = {};
    CHECKPOINTS.forEach((cp) => {
      initial[cp] = 'Pass';
    });
    return initial;
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=60',
  ]);

  useEffect(() => {
    if (selectedQC) {
      setQcId(selectedQC.id || '');
      setPassed(selectedQC.passedQuantity != null ? String(selectedQC.passedQuantity) : String(selectedQC.quantityInspected || '0'));
      setFailed(selectedQC.failedQuantity != null ? String(selectedQC.failedQuantity) : '0');
      setInspector(selectedQC.inspector || 'Rahul Sharma');
      setDefectType(selectedQC.defectType || 'None');
      setDefectDescription(selectedQC.defectDescription || '');
      setNotes(selectedQC.defectNotes || '');
      setInspectionDate(selectedQC.inspectionDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
      if (selectedQC.checkpoints) {
        setCheckpoints(selectedQC.checkpoints);
      }
    } else if (qualityChecks && qualityChecks.length > 0) {
      const first = qualityChecks[0];
      if (first) {
        setQcId(first.id || '');
        setPassed(first.passedQuantity != null ? String(first.passedQuantity) : String(first.quantityInspected || '0'));
        setFailed(first.failedQuantity != null ? String(first.failedQuantity) : '0');
        setInspector(first.inspector || 'Rahul Sharma');
        setDefectType(first.defectType || 'None');
        setDefectDescription(first.defectDescription || '');
        setNotes(first.defectNotes || '');
        setInspectionDate(first.inspectionDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        if (first.checkpoints) {
          setCheckpoints(first.checkpoints);
        }
      }
    }
  }, [selectedQC, qualityChecks, open]);

  const handleQCChange = (newQcId: string) => {
    setQcId(newQcId);
    const item = qualityChecks.find((q) => q.id === newQcId);
    if (item) {
      setPassed(item.passedQuantity != null ? String(item.passedQuantity) : String(item.quantityInspected || '0'));
      setFailed(item.failedQuantity != null ? String(item.failedQuantity) : '0');
      setInspector(item.inspector || 'Rahul Sharma');
      setDefectType(item.defectType || 'None');
      setDefectDescription(item.defectDescription || '');
      setNotes(item.defectNotes || '');
      setInspectionDate(item.inspectionDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    }
  };

  const currentItem = qualityChecks.find((q) => q.id === qcId);

  const handleCheckpointChange = (cp: string, status: CheckpointStatus) => {
    setCheckpoints((prev) => ({ ...prev, [cp]: status }));
  };

  const handlePassAllQC = () => {
    if (!currentItem) return;
    const total = currentItem.quantityInspected;
    const allPass: Record<string, CheckpointStatus> = {};
    CHECKPOINTS.forEach((cp) => {
      allPass[cp] = 'Pass';
    });
    setCheckpoints(allPass);
    setPassed(String(total));
    setFailed('0');
    setDefectType('None');
    setDefectDescription('Batch passed all 7 tolerance checkpoints with zero defects.');

    recordQualityCheck({
      qcId,
      passedQuantity: total,
      failedQuantity: 0,
      inspector,
      defectType: 'None',
      defectNotes: 'All 7 checkpoints passed successfully. Full batch cleared for stock.',
      defectDescription: 'Batch passed all 7 tolerance checkpoints with zero defects.',
      checkpoints: allPass,
      images: uploadedImages,
    });

    toast.success(`Passed 100% of batch ${currentItem.batchNumber}. ${total} units credited to Stock-in-Hand.`);
    onOpenChange(false);
  };

  const handleFailQC = () => {
    if (!currentItem) return;
    const total = currentItem.quantityInspected;
    setPassed('0');
    setFailed(String(total));
    const finalDefect = defectType === 'None' ? 'Fabric Flaw' : defectType;
    const finalDesc = defectDescription || 'Batch failed quality standards. Quarantined for factory rework.';

    recordQualityCheck({
      qcId,
      passedQuantity: 0,
      failedQuantity: total,
      inspector,
      defectType: finalDefect,
      defectNotes: notes || 'Batch failed inspection. Logged into Delays & Issues.',
      defectDescription: finalDesc,
      checkpoints,
      images: uploadedImages,
    });

    toast.error(`Batch ${currentItem.batchNumber} marked as Failed. Issue automatically created in Delays & Issues.`);
    onOpenChange(false);
  };

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
      defectDescription,
      checkpoints,
      images: uploadedImages,
    });

    if (fQty > 0) {
      toast.warning(`QC saved. ${pQty} units credited to stock. ${fQty} failed units logged as issue in Delays & Issues.`);
    } else {
      toast.success(`Quality inspection saved. ${pQty} approved units moved to available stock.`);
    }

    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span>Record Quality Inspection</span>
            <Badge variant="outline" className="text-[10px] font-mono">Gate 4</Badge>
          </SheetTitle>
          <SheetDescription>
            Audit batch quality across tolerance checkpoints. Approved units move directly into available stock.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="qc-select">Inspection Batch *</Label>
            <Select value={qcId} onValueChange={handleQCChange}>
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
            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5 border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product & SKU:</span>
                <span className="font-semibold text-foreground">{currentItem.product} ({currentItem.sku})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batch & PO:</span>
                <span className="font-mono">{currentItem.batchNumber} • {currentItem.productionOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contract Manufacturer:</span>
                <span>{currentItem.manufacturer}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t text-foreground">
                <span>Total Quantity to Inspect:</span>
                <span className="font-mono text-sm">{currentItem.quantityInspected} units</span>
              </div>
            </div>
          )}

          {/* 7 Quality Checkpoints */}
          <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-foreground text-xs">Quality Checkpoints (Tolerance Audit)</Label>
              <span className="text-[10px] text-muted-foreground">Pass / Fail / N/A</span>
            </div>
            <div className="space-y-1.5">
              {CHECKPOINTS.map((cp) => {
                const currentStatus = checkpoints[cp] || 'Pass';
                return (
                  <div
                    key={cp}
                    className="flex items-center justify-between p-1.5 rounded-md bg-background/60 border text-xs"
                  >
                    <span className="font-medium text-foreground">{cp}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCheckpointChange(cp, 'Pass')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                          currentStatus === 'Pass'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Check className="h-3 w-3" /> Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckpointChange(cp, 'Fail')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                          currentStatus === 'Fail'
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <X className="h-3 w-3" /> Fail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckpointChange(cp, 'NA')}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                          currentStatus === 'NA'
                            ? 'bg-muted text-foreground border'
                            : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <Minus className="h-3 w-3" /> N/A
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qc-passed" className="text-emerald-600 dark:text-emerald-400">
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
              <p className="text-[10px] text-muted-foreground">Will move directly into available stock</p>
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
              <p className="text-[10px] text-muted-foreground">Logged as issue in Delays & Issues</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <Label htmlFor="qc-date">Inspection Date</Label>
              <Input
                id="qc-date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
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
            <Label htmlFor="qc-desc">Defect Description (if defects observed)</Label>
            <Textarea
              id="qc-desc"
              placeholder="Detail specific issues: e.g. Left sleeve cuff hem unraveling by 3cm, zipper teeth misaligned."
              rows={2}
              value={defectDescription}
              onChange={(e) => setDefectDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qc-notes">Inspector Notes & Recommendations</Label>
            <Textarea
              id="qc-notes"
              placeholder="e.g. Factory warned on thread tension. Quarantine bay B-04."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Image Upload simulation */}
          <div className="space-y-1.5">
            <Label className="text-xs">Inspection Photographs</Label>
            <div className="flex items-center gap-2">
              {uploadedImages.map((img, i) => (
                <div key={i} className="h-14 w-14 rounded-md overflow-hidden border relative group">
                  <img src={img} alt="QC sample" className="h-full w-full object-cover" />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-14 border-dashed px-3 text-xs text-muted-foreground flex flex-col gap-1 items-center justify-center"
                onClick={() => {
                  setUploadedImages((prev) => [
                    ...prev,
                    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=150&auto=format&fit=crop&q=60',
                  ]);
                  toast.success('Inspection photo attached');
                }}
              >
                <Upload className="h-4 w-4" />
                <span>Add Photo</span>
              </Button>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={handleFailQC}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" /> Fail QC
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                onClick={handlePassAllQC}
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Pass 100%
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Inspection
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
