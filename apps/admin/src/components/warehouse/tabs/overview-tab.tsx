'use client';

import React from 'react';
import { WarehouseKPICards } from '../warehouse-kpi-cards';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Truck,
  TrendingUp,
} from 'lucide-react';
import { useWarehouseStore, DelayAlertItem, StockItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface OverviewTabProps {
  onTabChange: (tab: string, subTab?: string) => void;
  onOpenProcurement: () => void;
  onOpenProduction: () => void;
  onOpenQC: () => void;
  onOpenTransfer: () => void;
  onOpenAdjust: (item?: StockItem) => void;
}

export function OverviewTab({
  onTabChange,
  onOpenProcurement,
  onOpenProduction,
  onOpenQC,
  onOpenTransfer,
  onOpenAdjust,
}: OverviewTabProps) {
  const { stock, alerts, stockMovements, resolveAlert } = useWarehouseStore();

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const recentMovements = stockMovements.slice(0, 6);

  // Watchlist: items where available <= reorderLevel
  const lowStockWatchlist = stock.filter((s) => s.available <= s.reorderLevel);

  // Regional Warehouse network data
  const regionalWarehouses = [
    {
      name: 'Central Hub – BLR',
      location: 'Bengaluru, Karnataka',
      capacityUtilization: 82,
      stockInHand: 7470,
      availableStock: 5820,
      reservedStock: 1650,
      incomingStock: 2124,
    },
    {
      name: 'North DC – DEL',
      location: 'Gurugram, Delhi NCR',
      capacityUtilization: 45,
      stockInHand: 1050,
      availableStock: 655,
      reservedStock: 395,
      incomingStock: 1150,
    },
    {
      name: 'West DC – BOM',
      location: 'Bhiwandi, Mumbai MMR',
      capacityUtilization: 38,
      stockInHand: 740,
      availableStock: 300,
      reservedStock: 440,
      incomingStock: 2700,
    },
  ];

  const handleAlertAction = (alt: DelayAlertItem) => {
    switch (alt.type) {
      case 'Procurement Delay':
      case 'Supplier Delay':
        onTabChange('procurement');
        break;
      case 'Production Delay':
      case 'Manufacturer Delay':
      case 'Raw Material Shortage':
        onTabChange('production-orders');
        break;
      case 'QC Delay':
      case 'QC Failure':
        onTabChange('quality-checks');
        break;
      case 'Stock Shortage':
        onTabChange('stock', 'stock-in-hand');
        break;
      case 'Incoming Shipment Delay':
        onTabChange('stock', 'incoming-stock');
        break;
      case 'Fulfilment Risk':
        onTabChange('fulfilment');
        break;
      default:
        resolveAlert(alt.id);
        toast.success(`Action initiated for ${alt.entityId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 8 Metric KPI Cards with Clickable Drill-down */}
      <WarehouseKPICards onDrillDown={onTabChange} />

      {/* Quick Operations Bar (Real Actions) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card rounded-xl border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Operations:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={onOpenProcurement} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Procurement
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenProduction} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Schedule Production
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenQC} className="gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Record Inspection
          </Button>
          <Button size="sm" variant="outline" onClick={onOpenTransfer} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Transfer Stock
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onOpenAdjust()} className="gap-1.5 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Delays & Alerts + Regional Warehouses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Delays & Critical Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Operational Delays & Critical Alerts
              </CardTitle>
              <CardDescription>
                Auto-detected supply chain blockers across procurement, factories, QC, and stock
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-destructive border-destructive/30">
              {activeAlerts.length} Active
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.slice(0, 4).map((alt) => (
              <div
                key={alt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={alt.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {alt.type}
                    </Badge>
                    <span className="font-semibold text-xs text-foreground truncate">
                      {alt.product}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Ref: {alt.entityId}
                    </span>
                    {alt.daysDelayed > 0 && (
                      <span className="text-[10px] font-bold text-destructive">
                        +{alt.daysDelayed}d delayed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{alt.reason}</p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Owner: <span className="font-medium text-foreground">{alt.responsibleParty}</span> • Reported {alt.createdTime}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-medium gap-1 text-primary hover:text-primary"
                    onClick={() => handleAlertAction(alt)}
                  >
                    {alt.recommendedAction} <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Regional Warehouses (Interactive: Clickable to view details) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Regional Warehouses
            </CardTitle>
            <CardDescription>Live facility capacity & allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionalWarehouses.map((wh) => (
              <div
                key={wh.name}
                onClick={() => onTabChange('stock', 'warehouse-wise')}
                className="p-3.5 rounded-lg border bg-muted/20 hover:border-primary/50 hover:bg-muted/40 cursor-pointer transition-all space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {wh.name}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-[11px] text-muted-foreground">{wh.location}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {wh.capacityUtilization}% Full
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[11px] pt-2 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">In-Hand</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatNumber(wh.stockInHand)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Available</span>
                    <span className="font-mono font-semibold text-green-600 dark:text-green-400">
                      {formatNumber(wh.availableStock)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Reserved</span>
                    <span className="font-mono text-muted-foreground">
                      {formatNumber(wh.reservedStock)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Incoming</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      +{formatNumber(wh.incomingStock)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Watchlist & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watchlist */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Low Stock Watchlist</CardTitle>
              <CardDescription>
                Triggered automatically when Available ≤ Reorder Level or Available = 0
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1"
              onClick={() => onTabChange('stock', 'stock-in-hand')}
            >
              Full Inventory <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product / SKU</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Reorder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockWatchlist.length > 0 ? (
                    lowStockWatchlist.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-xs text-foreground">{item.product}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                        </TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{item.warehouse}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs">
                          <span className={item.available === 0 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}>
                            {item.available}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {item.reorderLevel}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === 'Out of Stock' ? 'destructive' : 'outline'}
                            className={`text-[10px] ${item.status === 'Low Stock' ? 'text-amber-600 border-amber-500/30' : ''}`}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={onOpenProcurement}
                          >
                            Procure
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-xs text-muted-foreground h-16">
                        All SKUs are healthy and above reorder threshold.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements (Green positive, Red negative) */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Stock Movements</CardTitle>
              <CardDescription>Live audit entries of receipts, reservations, and dispatches</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1"
              onClick={() => onTabChange('stock', 'stock-movements')}
            >
              Audit Trail <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">New Level</TableHead>
                    <TableHead>Ref ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((mov) => {
                    const isPositive = mov.qtyIn > 0;
                    return (
                      <TableRow key={mov.id}>
                        <TableCell>
                          <div className="font-medium text-xs truncate max-w-[130px] text-foreground">
                            {mov.product}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{mov.warehouse}</div>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {mov.dateTime}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {mov.movementType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs">
                          {isPositive ? (
                            <span className="text-green-600 dark:text-green-400">+{mov.qtyIn}</span>
                          ) : (
                            <span className="text-destructive">-{mov.qtyOut || mov.quantity}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold">
                          {mov.newStock}
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-muted-foreground">
                          {mov.referenceId}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
