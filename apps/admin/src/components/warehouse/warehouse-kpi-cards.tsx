'use client';

import React from 'react';
import {
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Factory,
  ClipboardCheck,
  Truck,
  TrendingUp,
  PackageCheck,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { useWarehouseStore } from '@/stores/warehouse';

interface WarehouseKPICardsProps {
  onDrillDown?: (targetTab: string, subTab?: string) => void;
}

export function WarehouseKPICards({ onDrillDown }: WarehouseKPICardsProps) {
  const getOverviewMetrics = useWarehouseStore((s) => s.getOverviewMetrics);
  const metrics = getOverviewMetrics();

  const cards = [
    {
      title: 'Total Stock',
      value: formatNumber(metrics.totalStock),
      subtitle: 'Across 3 regional hubs',
      icon: Boxes,
      badgeText: '+4.8%',
      statusTone: 'neutral', // Normal info
      targetTab: 'stock',
      subTab: 'stock-in-hand',
    },
    {
      title: 'Available Stock',
      value: formatNumber(metrics.availableStock),
      subtitle: 'Unreserved & ready to sell',
      icon: CheckCircle2,
      badgeText: '70.7% available',
      statusTone: 'green', // Healthy / Ready
      targetTab: 'stock',
      subTab: 'available-stock',
    },
    {
      title: 'Reserved Stock',
      value: formatNumber(metrics.reservedStock),
      subtitle: 'Allocated to active orders',
      icon: Clock,
      badgeText: '17.9% reserved',
      statusTone: 'amber', // Warning / Pending
      targetTab: 'stock',
      subTab: 'reserved-stock',
    },
    {
      title: 'Incoming Stock',
      value: formatNumber(metrics.incomingStock),
      subtitle: 'Expected from POs & runs',
      icon: Truck,
      badgeText: '+12.4% arriving',
      statusTone: 'neutral',
      targetTab: 'stock',
      subTab: 'incoming-stock',
    },
    {
      title: 'Under Production',
      value: formatNumber(metrics.underProduction),
      subtitle: 'Across 4 contract factories',
      icon: Factory,
      badgeText: '5 active runs',
      statusTone: 'neutral',
      targetTab: 'production-tracking',
    },
    {
      title: 'QC Pending',
      value: formatNumber(metrics.qcPending),
      subtitle: 'Awaiting bay inspection',
      icon: ClipboardCheck,
      badgeText: metrics.qcPending > 0 ? 'Action required' : 'Clear',
      statusTone: metrics.qcPending > 0 ? 'amber' : 'green',
      targetTab: 'quality-checks',
    },
    {
      title: 'Delayed Orders',
      value: metrics.delayedOrders.toString(),
      subtitle: 'Procurement & factory halts',
      icon: AlertTriangle,
      badgeText: metrics.delayedOrders > 0 ? `${metrics.delayedOrders} delayed` : 'On schedule',
      statusTone: metrics.delayedOrders > 0 ? 'red' : 'green',
      targetTab: 'overview',
    },
    {
      title: 'Fulfilment Ready',
      value: `${metrics.fulfilmentReadyPercent}%`,
      subtitle: 'Orders passed all 6 gates',
      icon: PackageCheck,
      badgeText: '+2.1% this week',
      statusTone: metrics.fulfilmentReadyPercent >= 80 ? 'green' : 'amber',
      targetTab: 'fulfilment',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const isClickable = Boolean(onDrillDown && c.targetTab);

        return (
          <Card
            key={i}
            onClick={() => onDrillDown && onDrillDown(c.targetTab, c.subTab)}
            className={`overflow-hidden group metric-glow transition-all duration-200 border bg-card ${
              isClickable ? 'cursor-pointer hover:border-primary/50 hover:shadow-md' : 'cursor-default'
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                      {c.title}
                    </p>
                    {isClickable && (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    )}
                  </div>
                  <p className="text-2xl font-bold tracking-tight mt-1.5 text-foreground font-mono">
                    {c.value}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-muted-foreground truncate">
                    {c.statusTone === 'red' ? (
                      <span className="text-destructive font-medium flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {c.badgeText}
                      </span>
                    ) : c.statusTone === 'green' ? (
                      <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" />
                        {c.badgeText}
                      </span>
                    ) : c.statusTone === 'amber' ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {c.badgeText}
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-medium">{c.badgeText}</span>
                    )}
                    <span className="text-muted-foreground/40">•</span>
                    <span className="truncate text-muted-foreground/80">{c.subtitle}</span>
                  </div>
                </div>
                <div
                  className={`shrink-0 rounded-lg p-2.5 transition-all duration-200 group-hover:scale-105 ${
                    c.statusTone === 'red'
                      ? 'bg-destructive/10 text-destructive'
                      : c.statusTone === 'green'
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : c.statusTone === 'amber'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  <c.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
