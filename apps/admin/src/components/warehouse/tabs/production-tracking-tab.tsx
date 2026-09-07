'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  Clock,
  Factory,
  Search,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useWarehouseStore, ProductionTrackingItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function ProductionTrackingTab() {
  const { productionTracking, updateProductionProgress } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = productionTracking.filter(
    (item) =>
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickAddOutput = (item: ProductionTrackingItem) => {
    const input = window.prompt(
      `Log produced units for ${item.orderId} (${item.product}):\nCurrent produced: ${item.produced} / ${item.ordered}\nEnter batch increment quantity:`,
      '100'
    );
    if (!input) return;
    const addQty = parseInt(input, 10);
    if (isNaN(addQty) || addQty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    const total = Math.min(item.ordered, item.produced + addQty);
    updateProductionProgress(item.orderId, total);
    toast.success(`Logged ${addQty} units for ${item.orderId}`);
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
        <span className="text-xs text-muted-foreground">
          {filteredData.length} production orders actively tracked
        </span>
      </div>

      {/* Visual Tracking Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredData.map((item) => (
          <Card key={item.id} className="overflow-hidden border">
            <CardHeader className="pb-3 bg-muted/20 border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-foreground">
                      Production Order: {item.orderId}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.currentStage}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mt-1">{item.product}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Factory className="h-3.5 w-3.5" />
                    {item.manufacturer}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-primary">
                    {item.productionPercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block">Completed</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Progress metrics row */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border text-center">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                    Ordered
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {formatNumber(item.ordered)}
                  </span>
                </div>
                <div className="border-x border-border/50">
                  <span className="text-[10px] uppercase font-semibold text-green-600 dark:text-green-400 tracking-wider block">
                    Produced
                  </span>
                  <span className="text-base font-bold font-mono text-green-600 dark:text-green-400">
                    {formatNumber(item.produced)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                    Remaining
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {formatNumber(item.remaining)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> Stage Status:
                    <span className="text-foreground font-semibold ml-1">{item.currentStatus}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Est: {item.expectedDate}
                  </span>
                </div>
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, item.productionPercent))}%` }}
                  />
                </div>
              </div>

              {/* Milestone Stage Stepper */}
              <div className="space-y-2 pt-1 border-t">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Production Pipeline:
                </span>
                <div className="space-y-1.5">
                  {item.stages.map((stg, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {stg.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
                        ) : stg.current ? (
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/30 ml-0.5 mr-1" />
                        )}
                        <span
                          className={
                            stg.completed
                              ? 'text-muted-foreground line-through'
                              : stg.current
                              ? 'font-semibold text-foreground'
                              : 'text-muted-foreground'
                          }
                        >
                          {stg.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">{stg.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1"
                  onClick={() => handleQuickAddOutput(item)}
                >
                  <TrendingUp className="h-3.5 w-3.5" /> Log Batch Output
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
