'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  Factory,
  Search,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Layers,
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

  const filteredData = productionTracking.filter(
    (item) =>
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickAdvance = (item: ProductionTrackingItem) => {
    const currentIndex = STAGES_ORDER.indexOf(item.currentStage);
    if (currentIndex < STAGES_ORDER.length - 1) {
      const nextStage = STAGES_ORDER[currentIndex + 1];
      const newQty = nextStage === 'Production Completed' || nextStage === 'Quality Check'
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredData.map((item) => {
          const currentStageIdx = STAGES_ORDER.indexOf(item.currentStage);

          return (
            <Card key={item.id} className="overflow-hidden border bg-card">
              <CardHeader className="pb-3 bg-muted/20 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {item.orderId}
                      </span>
                      <Badge
                        variant={item.delayDays > 0 ? 'destructive' : 'outline'}
                        className="text-[10px]"
                      >
                        {item.currentStage}
                      </Badge>
                      {item.delayDays > 0 && (
                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> +{item.delayDays}d Delay
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mt-1">{item.product}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Factory className="h-3.5 w-3.5" />
                      {item.manufacturer}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-primary">
                      {item.progress}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block">Overall Progress</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-2 p-2.5 bg-muted/40 rounded-lg border text-center font-mono">
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Ordered
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatNumber(item.orderedQty)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-green-600 dark:text-green-400 tracking-wider block">
                      Completed
                    </span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {formatNumber(item.completedQty)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Remaining
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatNumber(item.orderedQty - item.completedQty)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Est. Due
                    </span>
                    <span className="text-xs font-semibold text-foreground whitespace-nowrap block pt-0.5">
                      {item.expectedCompletion}
                    </span>
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
                      Started: {item.startDate}
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
                </div>

                {/* 7-Stage Visual Pipeline Stepper */}
                <div className="space-y-2 pt-1 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      7-Stage Supply Pipeline:
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Stage {currentStageIdx + 1} of 7
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {STAGES_ORDER.map((stageName, sIdx) => {
                      const isCompleted = sIdx < currentStageIdx;
                      const isCurrent = sIdx === currentStageIdx;

                      return (
                        <div
                          key={stageName}
                          className={`flex items-center justify-between text-xs py-1 px-2.5 rounded transition-colors ${
                            isCurrent
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                            ) : isCurrent ? (
                              <Clock className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/30 ml-0.5 mr-1" />
                            )}
                            <span
                              className={
                                isCompleted
                                  ? 'text-muted-foreground line-through'
                                  : isCurrent
                                  ? 'font-bold text-foreground'
                                  : 'text-muted-foreground'
                              }
                            >
                              {stageName}
                            </span>
                          </div>
                          {isCurrent && (
                            <Badge variant="outline" className="text-[9px] font-semibold text-primary border-primary/30">
                              Active
                            </Badge>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-mono">Done</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    Status: <span className="font-medium text-foreground">{item.status}</span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => handleQuickAdvance(item)}
                  >
                    <TrendingUp className="h-3 w-3" /> Advance Stage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
