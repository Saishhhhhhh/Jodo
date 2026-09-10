'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  Clock,
  Factory,
  Search,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Layers,
  Edit,
  SlidersHorizontal,
} from 'lucide-react';
import { useWarehouseStore, ProductionTrackingItem, ProductionTrackingStageName } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

const STAGES_ORDER: ProductionTrackingStageName[] = [
  'Scheduled',
  'Materials Allocated',
  'Production Started',
  'In Production',
  'Production Completed',
  'Quality Check',
  'Ready for Stock-In',
];

export function ProductionTrackingTab() {
  const { productionTracking, updateProductionStage } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Update Production Modal state
  const [updateItem, setUpdateItem] = useState<ProductionTrackingItem | null>(null);
  const [completedQtyInput, setCompletedQtyInput] = useState(0);
  const [stageInput, setStageInput] = useState<ProductionTrackingStageName>('In Production');
  const [statusInput, setStatusInput] = useState('In Production');
  const [notesInput, setNotesInput] = useState('');
  const [updatedByInput, setUpdatedByInput] = useState('Rahul Sharma (Floor Supervisor)');
  const [updateDateInput, setUpdateDateInput] = useState(
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  );

  const filteredData = productionTracking.filter(
    (item) =>
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenUpdate = (item: ProductionTrackingItem) => {
    setUpdateItem(item);
    setCompletedQtyInput(item.completedQty);
    setStageInput(item.currentStage);
    setStatusInput(item.status);
    setNotesInput('');
    setUpdatedByInput('Rahul Sharma (Floor Supervisor)');
    setUpdateDateInput(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateItem) return;

    updateProductionStage(updateItem.orderId, stageInput, completedQtyInput);
    const calculatedProgress = Math.min(100, Math.round((completedQtyInput / updateItem.orderedQty) * 100));
    toast.success(
      `Updated ${updateItem.orderId}: ${completedQtyInput}/${updateItem.orderedQty} units (${calculatedProgress}%). Stage: ${stageInput}`
    );
    setUpdateItem(null);
  };

  const handleQuickAdvance = (item: ProductionTrackingItem) => {
    const currentIndex = STAGES_ORDER.indexOf(item.currentStage);
    if (currentIndex < STAGES_ORDER.length - 1) {
      const nextStage = STAGES_ORDER[currentIndex + 1];
      const newQty =
        nextStage === 'Production Completed' || nextStage === 'Quality Check'
          ? item.orderedQty
          : Math.round(item.orderedQty * ((currentIndex + 1) / (STAGES_ORDER.length - 1)));
      updateProductionStage(item.orderId, nextStage, newQty);
      toast.success(`Advanced ${item.orderId} to stage: ${nextStage}`);
    } else {
      toast.info('Order has reached final Ready for Stock-In stage');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search tracked runs by ID, product, factory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500" /> Live Visual Tracking Pipeline (7 Stages)
        </div>
      </div>

      {/* Visual Tracking Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item) => {
          const currentStageIdx = STAGES_ORDER.indexOf(item.currentStage);

          return (
            <Card key={item.id} className="border shadow-sm hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground">{item.orderId}</span>
                      {item.delayDays > 0 ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Delayed ({item.delayDays}d)
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">
                          On Schedule
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-foreground mt-1">{item.product}</h4>
                    <p className="text-xs text-muted-foreground">{item.manufacturer}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-foreground">
                      {formatNumber(item.completedQty)} / {formatNumber(item.orderedQty)}
                    </div>
                    <span className="text-[11px] text-muted-foreground">units completed</span>
                  </div>
                </div>

                {/* Progress Bar with current status banner */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-primary" /> Current Stage:
                      <span className="font-semibold text-foreground ml-1">{item.currentStage}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Target: {item.expectedCompletion}
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.delayDays > 0 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Remaining: {Math.max(0, item.orderedQty - item.completedQty)} units</span>
                    <span className="font-mono font-bold text-foreground">{item.progress}%</span>
                  </div>
                </div>

                {/* 7-Stage Visual Pipeline Stepper */}
                <div className="space-y-1.5 pt-1 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      7-Stage Progress:
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Stage {currentStageIdx + 1} of 7
                    </span>
                  </div>

                  <div className="space-y-1">
                    {STAGES_ORDER.map((stageName, sIdx) => {
                      const isCompleted = sIdx < currentStageIdx;
                      const isCurrent = sIdx === currentStageIdx;

                      return (
                        <div
                          key={stageName}
                          className={`flex items-center justify-between text-xs py-0.5 px-2 rounded transition-colors ${
                            isCurrent
                              ? 'bg-primary/10 border border-primary/20 font-semibold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : isCurrent ? (
                              <Clock className="h-3 w-3 text-primary shrink-0 animate-pulse" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 ml-0.5 mr-1" />
                            )}
                            <span className={isCompleted ? 'line-through text-muted-foreground/70' : ''}>
                              {stageName}
                            </span>
                          </div>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[9px] text-primary border-primary/30">
                              Active
                            </Badge>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Done</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleOpenUpdate(item)}
                  >
                    <Edit className="h-3 w-3" /> Update Production
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs gap-1 text-primary"
                    onClick={() => handleQuickAdvance(item)}
                  >
                    <TrendingUp className="h-3 w-3" /> Next Stage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section 11: Update Production Modal */}
      {updateItem && (
        <Dialog open={!!updateItem} onOpenChange={(open) => !open && setUpdateItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Factory className="h-4 w-4 text-primary" />
                <span>Update Production — {updateItem.orderId}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {updateItem.product} ({updateItem.manufacturer}) • Total Ordered: {updateItem.orderedQty} units
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveUpdate} className="space-y-3.5 py-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="completed-qty">Completed Quantity (units) *</Label>
                <Input
                  id="completed-qty"
                  type="number"
                  min="0"
                  max={updateItem.orderedQty}
                  value={completedQtyInput}
                  onChange={(e) => setCompletedQtyInput(parseInt(e.target.value, 10) || 0)}
                  required
                />
                <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>Calculated Progress:</span>
                  <span className="font-bold text-foreground font-mono">
                    {Math.min(100, Math.round((completedQtyInput / updateItem.orderedQty) * 100))}%
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stage-select">Current Production Stage *</Label>
                <Select value={stageInput} onValueChange={(val: any) => setStageInput(val)}>
                  <SelectTrigger id="stage-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES_ORDER.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status-select">Floor Status</Label>
                <Select value={statusInput} onValueChange={setStatusInput}>
                  <SelectTrigger id="status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Production">In Production</SelectItem>
                    <SelectItem value="QC Pending">QC Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                    <SelectItem value="Material Pending">Material Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="updated-by">Updated By *</Label>
                  <Input
                    id="updated-by"
                    value={updatedByInput}
                    onChange={(e) => setUpdatedByInput(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="update-date">Update Date</Label>
                  <Input
                    id="update-date"
                    value={updateDateInput}
                    onChange={(e) => setUpdateDateInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="update-notes">Floor Notes & Status Observation</Label>
                <Textarea
                  id="update-notes"
                  placeholder="e.g. Stitched 350 units today on Line 2. Button attachment proceeding smoothly."
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setUpdateItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Progress
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
