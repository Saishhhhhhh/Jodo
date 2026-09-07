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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { useWarehouseStore } from '@/stores/warehouse';

export function WarehouseKPICards() {
  const getOverviewMetrics = useWarehouseStore((s) => s.getOverviewMetrics);
  const metrics = getOverviewMetrics();

  const cards = [
    {
      title: 'Total Stock',
      value: formatNumber(metrics.totalStock),
      subtitle: 'Across 3 fulfillment hubs',
      icon: Boxes,
      badgeText: '+4.8%',
      isPositive: true,
    },
    {
      title: 'Available Stock',
      value: formatNumber(metrics.availableStock),
      subtitle: 'Unreserved & ready to sell',
      icon: CheckCircle2,
      badgeText: '70.7% of total',
      isPositive: true,
    },
    {
      title: 'Reserved Stock',
      value: formatNumber(metrics.reservedStock),
      subtitle: 'Locked for active orders',
      icon: Clock,
      badgeText: '17.9% of total',
      isPositive: false,
    },
    {
      title: 'Incoming Stock',
      value: formatNumber(metrics.incomingStock),
      subtitle: 'Expected next 7–14 days',
      icon: Truck,
      badgeText: '+12.4%',
      isPositive: true,
    },
    {
      title: 'Under Production',
      value: formatNumber(metrics.underProduction),
      subtitle: 'Across 4 manufacturers',
      icon: Factory,
      badgeText: 'Active orders',
      isPositive: true,
    },
    {
      title: 'QC Pending',
      value: formatNumber(metrics.qcPending),
      subtitle: 'Awaiting inspector signoff',
      icon: ClipboardCheck,
      badgeText: '2 inspection bays',
      isPositive: false,
    },
    {
      title: 'Delayed Orders',
      value: metrics.delayedOrders.toString(),
      subtitle: 'Procurement & factory delays',
      icon: AlertTriangle,
      badgeText: metrics.delayedOrders > 0 ? 'Requires action' : 'On schedule',
      isDelayed: metrics.delayedOrders > 0,
    },
    {
      title: 'Fulfilment Ready',
      value: `${metrics.fulfilmentReady}%`,
      subtitle: 'Orders ready for same-day ship',
      icon: PackageCheck,
      badgeText: '+2.1% this week',
      isPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <Card key={i} className="overflow-hidden group metric-glow cursor-default">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {c.title}
                </p>
                <p className="text-2xl font-bold tracking-tight mt-1.5 text-foreground">
                  {c.value}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-muted-foreground truncate">
                  {c.isDelayed ? (
                    <span className="text-destructive font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {c.badgeText}
                    </span>
                  ) : c.isPositive ? (
                    <span className="text-green-500 dark:text-green-400 font-medium flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {c.badgeText}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{c.badgeText}</span>
                  )}
                  <span className="text-muted-foreground/40">•</span>
                  <span className="truncate">{c.subtitle}</span>
                </div>
              </div>
              <div className="shrink-0 rounded-lg p-2.5 bg-primary/10 text-primary transition-all group-hover:bg-primary/15 group-hover:scale-110 duration-200">
                <c.icon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
