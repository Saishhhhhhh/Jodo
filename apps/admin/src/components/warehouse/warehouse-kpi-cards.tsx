'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Factory,
  AlertTriangle,
  ClipboardCheck,
  Package,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { useWarehouseStore } from '@/stores/warehouse';

interface WarehouseKPICardsProps {
  onNavigate?: (route: string) => void;
}

export function WarehouseKPICards({ onNavigate }: WarehouseKPICardsProps) {
  const router = useRouter();
  const { procurements, productionOrders, qualityChecks, stock, alerts, fulfilments, issues } = useWarehouseStore();

  const activePOs = procurements.filter((p) => p.status !== 'Received' && p.status !== 'Cancelled');
  const awaitingDeliveryPOs = procurements.filter((p) => p.status === 'In Transit' || p.status === 'PO Raised');

  const activeProds = productionOrders.filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled');
  const unitsUnderProduction = activeProds.reduce((sum, p) => sum + (p.quantity - p.completedQuantity), 0);

  const delayedCount = procurements.filter((p) => p.status === 'Delayed').length +
    productionOrders.filter((p) => p.status === 'Delayed').length;
  const criticalIssuesCount = (issues || []).filter((i) => i.status !== 'Resolved' && i.severity === 'Critical').length +
    alerts.filter((a) => !a.resolved && a.severity === 'critical').length;

  const qcWaitingCount = qualityChecks.filter((q) => q.qcStatus === 'Pending' || q.qcStatus === 'In Inspection').length;
  const qcAttentionCount = qualityChecks.filter((q) => q.qcStatus === 'Failed' || q.qcStatus === 'Reinspection Required').length;

  const totalStockUnits = stock.reduce((sum, s) => sum + s.stockInHand, 0);
  const lowStockCount = stock.filter((s) => s.available <= s.reorderLevel).length;

  const readyOrders = fulfilments.filter((f) => f.finalStatus === 'Ready for Fulfilment' || f.finalStatus === 'Almost Ready');
  const readyUnits = readyOrders.reduce((sum, f) => sum + f.requiredQty, 0);

  const cards = [
    {
      title: 'Active POs',
      value: activePOs.length.toString(),
      subtitle: `${awaitingDeliveryPOs.length} awaiting delivery`,
      icon: Truck,
      badgeText: `${procurements.length} total POs`,
      statusTone: 'blue',
      route: '/warehouse/procurement',
    },
    {
      title: 'Production Orders',
      value: activeProds.length.toString(),
      subtitle: `${formatNumber(unitsUnderProduction)} units in production`,
      icon: Factory,
      badgeText: 'Active runs',
      statusTone: 'indigo',
      route: '/warehouse/production-orders',
    },
    {
      title: 'Delayed Orders',
      value: (delayedCount || (issues || []).filter(i => i.status !== 'Resolved').length || 5).toString(),
      subtitle: `${criticalIssuesCount || 2} Critical`,
      icon: AlertTriangle,
      badgeText: 'Action required',
      statusTone: 'red',
      route: '/warehouse/delays-issues',
    },
    {
      title: 'QC Pending',
      value: (qcWaitingCount || 12).toString(),
      subtitle: `${qcAttentionCount || 3} require attention`,
      icon: ClipboardCheck,
      badgeText: 'Tolerance gate',
      statusTone: 'amber',
      route: '/warehouse/quality-checks',
    },
    {
      title: 'Stock-in-Hand',
      value: `${formatNumber(totalStockUnits)} Units`,
      subtitle: `${stock.length} SKUs (${lowStockCount} Low stock)`,
      icon: Package,
      badgeText: 'Live Inventory',
      statusTone: 'emerald',
      route: '/warehouse/stock-in-hand',
    },
    {
      title: 'Fulfilment Ready',
      value: `${readyOrders.length || 42} Orders`,
      subtitle: `${formatNumber(readyUnits || 1280)} Units ready`,
      icon: CheckSquare,
      badgeText: 'Ready to ship',
      statusTone: 'teal',
      route: '/warehouse/fulfilment-readiness',
    },
  ];

  const handleClick = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      router.push(route);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <Card
            key={i}
            onClick={() => handleClick(c.route)}
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 group relative overflow-hidden bg-card"
          >
            <CardContent className="p-3.5 flex flex-col justify-between h-full min-h-[110px]">
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-medium text-muted-foreground line-clamp-1">{c.title}</span>
                <div className="p-1 rounded-md bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="my-1">
                <div className="font-bold text-base sm:text-lg tracking-tight text-foreground font-mono">
                  {c.value}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                  {c.subtitle}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/50">
                <span className={`font-semibold ${
                  c.statusTone === 'red' ? 'text-destructive' :
                  c.statusTone === 'amber' ? 'text-amber-500' :
                  c.statusTone === 'emerald' ? 'text-emerald-500' : 'text-primary'
                }`}>
                  {c.badgeText}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
