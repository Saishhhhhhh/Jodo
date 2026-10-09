'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  PackageCheck,
  Truck,
  Building,
  History,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Boxes,
} from 'lucide-react';
import { ProcurementItem, useWarehouseStore } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface ReceiveStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ProcurementItem | null;
}

export function ReceiveStockDialog({
  open,
  onOpenChange,
  item,
}: ReceiveStockDialogProps) {
  const { receiveProcurementStock } = useWarehouseStore();

  const [receiveQty, setReceiveQty] = useState<string>('');
  const [receiverName, setReceiverName] = useState('Operations Admin');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute pending units
  const quantityOrdered = item?.quantityOrdered ?? 0;
  const quantityReceived = item?.quantityReceived ?? 0;
  const pendingUnits = Math.max(0, quantityOrdered - quantityReceived);

  // Auto-fill default receive quantity when modal opens
  useEffect(() => {
    if (open && item) {
      setReceiveQty(pendingUnits > 0 ? pendingUnits.toString() : '0');
      setReceiverName('Operations Admin');
      setNotes('');
    }
  }, [open, item, pendingUnits]);

  if (!item) return null;

  const currentEnteredQty = parseInt(receiveQty, 10) || 0;
  const projectedTotalReceived = Math.min(quantityOrdered, quantityReceived + currentEnteredQty);
  const projectedRemaining = Math.max(0, quantityOrdered - projectedTotalReceived);
  const currentProgressPercent = quantityOrdered > 0 ? Math.round((quantityReceived / quantityOrdered) * 100) : 0;
  const projectedProgressPercent = quantityOrdered > 0 ? Math.round((projectedTotalReceived / quantityOrdered) * 100) : 0;

  const handleConfirm = () => {
    if (currentEnteredQty <= 0) {
      toast.error('Please enter a valid positive quantity greater than 0');
      return;
    }
    if (currentEnteredQty > pendingUnits) {
      toast.error(`Entered quantity (${currentEnteredQty}) exceeds pending units (${pendingUnits})`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      receiveProcurementStock(item.id, currentEnteredQty, {
        notes: notes.trim() || `Received ${currentEnteredQty} units at ${item.destinationWarehouse}`,
        receivedBy: receiverName.trim() || 'Operations Admin',
      });

      toast.success(
        `Successfully received ${formatNumber(currentEnteredQty)} units of ${item.product} into ${item.destinationWarehouse}!`
      );
      setIsSubmitting(false);
      onOpenChange(false);
    }, 200);
  };

  const receiptHistory = item.receiptHistory || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[11px]">
              {item.purchaseOrderNumber || item.id}
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              {item.destinationWarehouse}
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-500 border-none text-[11px]">
              {item.status}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary" />
            <span>Receive Inbound Stock</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Record physical stock arrival for <strong className="text-foreground">{item.product}</strong> ({item.sku}) from <span className="text-foreground">{item.supplier}</span>.
          </DialogDescription>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Summary Metric Pills */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border bg-muted/20">
              <span className="text-[10px] text-muted-foreground block font-medium">Total Ordered</span>
              <span className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5 block">
                {formatNumber(quantityOrdered)}
              </span>
              <span className="text-[10px] text-muted-foreground">Original PO units</span>
            </div>

            <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Already Received</span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {formatNumber(quantityReceived)}
              </span>
              <span className="text-[10px] text-muted-foreground">{currentProgressPercent}% completed</span>
            </div>

            <div className="p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">Pending Remaining</span>
              <span className="text-base sm:text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
                {formatNumber(pendingUnits)}
              </span>
              <span className="text-[10px] text-muted-foreground">Units to arrive</span>
            </div>
          </div>

          {/* Progress Visualizer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Delivery Progress</span>
              <span className="font-mono font-semibold text-foreground">
                {quantityReceived} / {quantityOrdered} units ({currentProgressPercent}%)
              </span>
            </div>
            <Progress value={currentProgressPercent} className="h-2" />
          </div>

          {/* Section 2: Inbound Receipt Input Form */}
          {pendingUnits > 0 ? (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="receive-qty-input" className="text-xs font-bold text-foreground">
                  Quantity Receiving Today
                </Label>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setReceiveQty(pendingUnits.toString())}
                  >
                    Receive All ({pendingUnits})
                  </Button>
                  {pendingUnits > 100 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => setReceiveQty(Math.round(pendingUnits / 2).toString())}
                    >
                      50% ({Math.round(pendingUnits / 2)})
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  id="receive-qty-input"
                  type="number"
                  min="1"
                  max={pendingUnits}
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                  placeholder="Enter quantity arriving today..."
                  className="font-mono text-base font-bold h-10 bg-card border-border"
                  autoFocus
                />

                {/* Real-time projection feedback */}
                {currentEnteredQty > 0 && (
                  <div className="p-2.5 rounded-lg bg-card/80 border text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>After this receipt:</span>
                      <span className="font-semibold text-foreground font-mono">
                        {formatNumber(projectedTotalReceived)} / {formatNumber(quantityOrdered)} units ({projectedProgressPercent}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Remaining balance after today:</span>
                      <span className="font-mono font-semibold text-amber-500">
                        {formatNumber(projectedRemaining)} units pending
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Extra details: Receiver and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">
                    Received By (Staff / Inspector)
                  </Label>
                  <Input
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. Operations Admin"
                    className="h-8 text-xs bg-card"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">
                    Delivery Note / Truck / Bill of Lading
                  </Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Truck #4, Dock B delivery"
                    className="h-8 text-xs bg-card"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
              <div className="font-bold text-sm text-foreground">Order Fully Received!</div>
              <p className="text-xs text-muted-foreground">
                All {formatNumber(quantityOrdered)} units of this Purchase Order have arrived and been added to inventory.
              </p>
            </div>
          )}

          {/* Section 3: The Below Part — Receipt History & Delivery Records */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Receipt History & Batch Records ({receiptHistory.length})
                </h4>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Every delivery log saved with timestamp
              </span>
            </div>

            {receiptHistory.length > 0 ? (
              <div className="rounded-lg border overflow-hidden bg-card divide-y">
                {receiptHistory.map((rec, index) => (
                  <div key={rec.id || index} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] border-none">
                          +{formatNumber(rec.receivedQty)} units
                        </Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {rec.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {rec.notes || 'Batch received at warehouse dock'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono text-foreground flex items-center gap-1 sm:justify-end">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{rec.receivedAt}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 sm:justify-end mt-0.5">
                        <User className="h-2.5 w-2.5" />
                        <span>{rec.receivedBy}</span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-amber-500">
                          {formatNumber(rec.remainingQty)} pending after
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-dashed text-center text-xs text-muted-foreground bg-muted/10 space-y-1">
                <Boxes className="h-5 w-5 text-muted-foreground mx-auto opacity-50" />
                <div>No delivery receipts recorded yet for this order.</div>
                <div className="text-[11px]">When you receive units above, the transaction record will be listed here.</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-muted/20 border-t flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>

          {pendingUnits > 0 && (
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || currentEnteredQty <= 0}
              onClick={handleConfirm}
              className="text-xs gap-1.5 shadow-sm"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Confirm & Record Receipt</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
