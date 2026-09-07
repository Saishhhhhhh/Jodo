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
  Truck,
} from 'lucide-react';
import { useWarehouseStore } from '@/stores/warehouse';

interface OverviewTabProps {
  onTabChange: (tab: string) => void;
  onOpenProcurement: () => void;
  onOpenProduction: () => void;
  onOpenQC: () => void;
  onOpenTransfer: () => void;
}

export function OverviewTab({
  onTabChange,
  onOpenProcurement,
  onOpenProduction,
  onOpenQC,
  onOpenTransfer,
}: OverviewTabProps) {
  const { stock, alerts, stockMovements, procurements, productionOrders } = useWarehouseStore();

  const criticalStock = stock.filter((s) => s.status === 'Critical' || s.status === 'Out of Stock');
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const recentMovements = stockMovements.slice(0, 5);

  // Warehouse breakdown
  const warehouseStats = [
    { name: 'Central Hub - BLR', location: 'Bengaluru', items: 3, stock: 7470, capacity: '82%' },
    { name: 'North DC - DEL', location: 'Delhi NCR', items: 2, stock: 1050, capacity: '45%' },
    { name: 'West DC - BOM', location: 'Mumbai', items: 2, stock: 740, capacity: '38%' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <WarehouseKPICards />

      {/* Action shortcuts bar */}
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
        </div>
      </div>

      {/* Critical Stock & Active Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Operational Delays & Critical Alerts
              </CardTitle>
              <CardDescription>Actionable exceptions requiring supply chain resolution</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1"
              onClick={() => onTabChange('delays-alerts')}
            >
              View All ({activeAlerts.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={alt.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {alt.type}
                    </Badge>
                    <span className="text-xs font-semibold">{alt.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{alt.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-muted-foreground block">{alt.timestamp}</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs font-medium text-primary"
                    onClick={() => onTabChange('delays-alerts')}
                  >
                    {alt.actionText}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Warehouse Network Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              Regional Warehouses
            </CardTitle>
            <CardDescription>Live capacity & distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {warehouseStats.map((wh) => (
              <div key={wh.name} className="p-3 rounded-lg border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{wh.name}</p>
                    <p className="text-[11px] text-muted-foreground">{wh.location}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {wh.capacity} Full
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <span>In-Hand Units:</span>
                  <span className="font-mono font-bold text-foreground">
                    {wh.stock.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stock Health & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical / Low Stock Watchlist */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Low Stock Watchlist</CardTitle>
              <CardDescription>Items near or below reorder threshold</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1"
              onClick={() => onTabChange('stock')}
            >
              Manage Stock <ArrowRight className="h-3.5 w-3.5" />
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalStock.length > 0 ? (
                    criticalStock.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-xs">{item.product}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {item.sku}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{item.warehouse}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-xs text-destructive">
                          {item.available}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === 'Out of Stock' ? 'destructive' : 'outline'}
                            className="text-[10px] text-destructive border-destructive/30"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-xs text-muted-foreground h-16">
                        All SKUs are above reorder threshold.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Stock Movements */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Movements</CardTitle>
              <CardDescription>Inbound receipts, dispatches, and transfers</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary gap-1"
              onClick={() => onTabChange('stock-movements')}
            >
              Full Audit Log <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">New Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>
                        <div className="font-medium text-xs truncate max-w-[150px]">{mov.product}</div>
                        <div className="text-[10px] text-muted-foreground">{mov.dateTime}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {mov.movementType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs">
                        {mov.qtyIn > 0 ? (
                          <span className="text-green-600 dark:text-green-400">+{mov.qtyIn}</span>
                        ) : (
                          <span className="text-destructive">-{mov.qtyOut}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-medium">
                        {mov.newStock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
