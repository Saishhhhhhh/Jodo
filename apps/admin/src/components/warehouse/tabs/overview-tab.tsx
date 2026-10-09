'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WarehouseKPICards } from '../warehouse-kpi-cards';
import { WarehouseLifecycleFlow } from '../warehouse-lifecycle-flow';
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
import { Progress } from '@/components/ui/progress';
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
  Truck,
  Factory,
  ClipboardCheck,
  CheckSquare,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useWarehouseStore, ProcurementItem, ProductionOrderItem, StockItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface OverviewTabProps {
  onOpenProcurement?: () => void;
  onOpenProduction?: () => void;
  onOpenQC?: () => void;
  onOpenAdjust?: (item?: StockItem) => void;
  onOpenProcessGuide?: () => void;
}

export function OverviewTab({
  onOpenProcurement,
  onOpenProduction,
  onOpenQC,
  onOpenAdjust,
  onOpenProcessGuide,
}: OverviewTabProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'guided' | 'detailed'>('guided');

  const {
    procurements,
    productionOrders,
    qualityChecks,
    stock,
    fulfilments,
    manufacturers,
    auditLog,
  } = useWarehouseStore();

  // Section 5: Production Status Chart Data
  const chartData = [
    {
      status: 'Planned',
      orders: productionOrders.filter((p) => p.status === 'Scheduled').length || 4,
      units: 1200,
      fill: '#6366f1',
    },
    {
      status: 'In Production',
      orders: productionOrders.filter((p) => p.status === 'In Production').length || 6,
      units: 2450,
      fill: '#3b82f6',
    },
    {
      status: 'QC Pending',
      orders: productionOrders.filter((p) => p.status === 'QC Pending').length || 3,
      units: 850,
      fill: '#f59e0b',
    },
    {
      status: 'Completed',
      orders: productionOrders.filter((p) => p.status === 'Completed').length || 15,
      units: 5400,
      fill: '#10b981',
    },
    {
      status: 'Delayed',
      orders: productionOrders.filter((p) => p.status === 'Delayed').length || 2,
      units: 600,
      fill: '#ef4444',
    },
  ];

  // Attention Alerts with 1-click resolvers
  const delayedOrdersCount = productionOrders.filter((p) => p.status === 'Delayed').length || 5;
  const lowStockCount = stock.filter((s) => s.available <= s.reorderLevel).length || 8;
  const qcPendingBatches = qualityChecks.filter((q) => q.qcStatus === 'Pending' || q.qcStatus === 'In Inspection').length || 12;
  const delayedMfgsCount = manufacturers.filter((m) => m.delayedOrdersCount > 0).length || 3;
  const waitingStockOrdersCount = fulfilments.filter((f) => !f.conditions?.stockAvailable).length || 7;

  const attentionAlerts = [
    {
      id: 'alt-1',
      title: `${delayedOrdersCount} Production Orders Delayed`,
      subtitle: 'Factory bottlenecks requiring delivery date review',
      severity: 'critical',
      route: '/warehouse/delays-issues',
      badge: 'Production Halt',
      actionLabel: 'Resolve Delay',
      actionFn: () => router.push('/warehouse/delays-issues'),
    },
    {
      id: 'alt-2',
      title: `${lowStockCount} Products Below Reorder Level`,
      subtitle: 'Stock levels breached safety threshold at Central Hub',
      severity: 'warning',
      route: '/warehouse/stock-in-hand',
      badge: 'Low Stock',
      actionLabel: 'Create PO',
      actionFn: () => (onOpenProcurement ? onOpenProcurement() : router.push('/warehouse/procurement')),
    },
    {
      id: 'alt-3',
      title: `${qcPendingBatches} Quality Checks Pending`,
      subtitle: 'Tolerance bay inspections awaiting approval before shelving',
      severity: 'warning',
      route: '/warehouse/quality-checks',
      badge: 'QC Gate',
      actionLabel: 'Record QC',
      actionFn: () => (onOpenQC ? onOpenQC() : router.push('/warehouse/quality-checks')),
    },
    {
      id: 'alt-4',
      title: `${delayedMfgsCount} Manufacturers Have Delayed Orders`,
      subtitle: 'Average lead times slipping by 3+ days',
      severity: 'critical',
      route: '/warehouse/contract-manufacturers',
      badge: 'Factory Risk',
      actionLabel: 'Inspect Factories',
      actionFn: () => router.push('/warehouse/contract-manufacturers'),
    },
    {
      id: 'alt-5',
      title: `${waitingStockOrdersCount} Customer Orders Waiting for Stock`,
      subtitle: 'Customer shipments held due to missing inventory allocation',
      severity: 'warning',
      route: '/warehouse/fulfilment-readiness',
      badge: 'Fulfilment Gate',
      actionLabel: 'Check Fulfilment',
      actionFn: () => router.push('/warehouse/fulfilment-readiness'),
    },
  ];

  // Recent data samples
  const recentPOs = procurements.slice(0, 5);
  const recentProds = productionOrders.slice(0, 4);
  const stockOverview = stock.slice(0, 5);

  const getStatusBadge = (status: ProcurementItem['status']) => {
    switch (status) {
      case 'Received':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">Received</Badge>;
      case 'In Transit':
      case 'PO Raised':
        return <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px]">{status}</Badge>;
      case 'Delayed':
        return <Badge variant="destructive" className="text-[10px]">Delayed</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards: High-level snapshot */}
      <WarehouseKPICards onNavigate={(route) => router.push(route)} />

      {/* View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <span>Operations Mode</span>
            <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
              {viewMode === 'guided' ? 'Simplified Flow' : 'Deep Grid'}
            </Badge>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {viewMode === 'guided'
              ? 'Easy 5-step lifecycle roadmap with 1-click action buttons and urgent bottlenecks.'
              : 'Complete operational tables, production bar charts, and warehouse audit telemetry.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border self-start sm:self-center">
          <Button
            variant={viewMode === 'guided' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs font-medium gap-1.5"
            onClick={() => setViewMode('guided')}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Guided Flow (Easy)</span>
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs font-medium gap-1.5"
            onClick={() => setViewMode('detailed')}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Full Data Grid</span>
          </Button>
        </div>
      </div>

      {/* 5-Step Interactive Warehouse Lifecycle Map */}
      <WarehouseLifecycleFlow
        onOpenProcurement={onOpenProcurement}
        onOpenProduction={onOpenProduction}
        onOpenQC={onOpenQC}
        onOpenAdjust={() => onOpenAdjust?.()}
        onOpenProcessGuide={onOpenProcessGuide}
      />

      {/* GUIDED FLOW MODE: Clean, high-impact cards without overwhelming tables */}
      {viewMode === 'guided' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Actionable Urgent Alerts */}
          <Card className="lg:col-span-7 border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    <span>Urgent Action Items ({attentionAlerts.length})</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Click "Fix" on any item to open the corresponding workflow immediately.
                  </CardDescription>
                </div>
                <Badge variant="destructive" className="text-[10px]">
                  Requires Attention
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {attentionAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <span className="text-destructive font-mono font-bold">●</span>
                      <span className="truncate">{alt.title}</span>
                      <Badge variant="outline" className="text-[10px] hidden md:inline-flex">
                        {alt.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{alt.subtitle}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 shrink-0 self-end sm:self-center gap-1 group-hover:border-primary/50 text-foreground"
                    onClick={alt.actionFn}
                  >
                    <span>{alt.actionLabel}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Sub-module Directory / Shortcuts */}
          <Card className="lg:col-span-5 border shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                <span>Quick Module Directory</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Jump directly into any specific warehouse workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                { title: 'Inbound POs', desc: 'Raw material shipments', route: '/warehouse/procurement', icon: Truck },
                { title: 'Contract Factories', desc: 'Vendor directory & ratings', route: '/warehouse/contract-manufacturers', icon: Building },
                { title: 'Work Orders', desc: 'Production floor batches', route: '/warehouse/production-orders', icon: Factory },
                { title: 'Quality Audits', desc: 'Tolerance inspections', route: '/warehouse/quality-checks', icon: ClipboardCheck },
                { title: 'Live Stock Levels', desc: 'Bins & inventory balances', route: '/warehouse/stock-in-hand', icon: Package },
                { title: 'Dispatch Readiness', desc: '6-gate shipping checklist', route: '/warehouse/fulfilment-readiness', icon: CheckSquare },
              ].map((sub, idx) => {
                const IconComp = sub.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => router.push(sub.route)}
                    className="p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/60 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {sub.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{sub.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* DETAILED MODE: Bar Charts, Tables & Comprehensive Activity Logs */}
      {viewMode === 'detailed' && (
        <div className="space-y-6 animate-fade-in">
          {/* Production Status Chart & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart */}
            <Card className="lg:col-span-7 border shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">Production Status Overview</CardTitle>
                    <CardDescription className="text-xs">Active order volumes categorised by floor status.</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => router.push('/warehouse/production-orders')}
                  >
                    View all orders <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="p-2.5 rounded-lg border bg-popover text-popover-foreground shadow-md text-xs space-y-1">
                                <div className="font-bold">{data.status}</div>
                                <div className="text-muted-foreground">Orders: <span className="font-semibold text-foreground">{data.orders} orders</span></div>
                                <div className="text-muted-foreground">Total Units: <span className="font-semibold font-mono text-foreground">{formatNumber(data.units)} units</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="lg:col-span-5 border shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span>Requires Attention</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Actionable bottlenecks needing immediate response.</CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">{attentionAlerts.length} Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {attentionAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={alt.actionFn}
                    className="p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/60 cursor-pointer transition-all text-xs flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <span className="text-destructive">⚠</span>
                        <span className="truncate">{alt.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{alt.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{alt.badge}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Section 6: Procurement Overview Table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Procurement Overview</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Inbound supplier shipments, raw materials replenishment and PO status.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => router.push('/warehouse/procurement')}
                  >
                    View All POs
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs h-8"
                    onClick={onOpenProcurement}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Create Purchase Order
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[11px]">PO Number</TableHead>
                    <TableHead className="text-[11px]">Supplier</TableHead>
                    <TableHead className="text-[11px]">Material / Product</TableHead>
                    <TableHead className="text-[11px] text-right">Quantity</TableHead>
                    <TableHead className="text-[11px]">Order Date</TableHead>
                    <TableHead className="text-[11px]">Expected Delivery</TableHead>
                    <TableHead className="text-[11px] text-right">Received Qty</TableHead>
                    <TableHead className="text-[11px]">Status</TableHead>
                    <TableHead className="text-[11px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPOs.map((po) => (
                    <TableRow key={po.id} className="text-xs hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono font-semibold text-foreground text-xs">{po.purchaseOrderNumber}</TableCell>
                      <TableCell className="text-foreground">{po.supplier}</TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{po.product}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{po.sku}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatNumber(po.quantityOrdered)}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{po.orderDate}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{po.expectedDeliveryDate}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {formatNumber(po.quantityReceived)}
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => router.push('/warehouse/procurement')}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Two columns: Recent Production Orders & Stock Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Production Orders */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Factory className="h-4 w-4 text-primary" />
                      <span>Recent Production Orders</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Contract manufacturing batches in flight.</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => router.push('/warehouse/production-orders')}
                  >
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[11px]">Order ID</TableHead>
                      <TableHead className="text-[11px]">Product</TableHead>
                      <TableHead className="text-[11px]">Manufacturer</TableHead>
                      <TableHead className="text-[11px]">Progress</TableHead>
                      <TableHead className="text-[11px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProds.map((prd) => (
                      <TableRow key={prd.id} className="text-xs hover:bg-muted/40">
                        <TableCell className="font-mono text-xs">{prd.id}</TableCell>
                        <TableCell className="font-medium">{prd.product}</TableCell>
                        <TableCell className="text-muted-foreground">{prd.manufacturer}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={prd.progress} className="w-16 h-1.5" />
                            <span className="text-[10px] font-mono">{prd.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{prd.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Stock Overview */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span>Stock-in-Hand Overview</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Real-time availability and safety stock levels.</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => router.push('/warehouse/stock-in-hand')}
                  >
                    Full inventory <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[11px]">Product</TableHead>
                      <TableHead className="text-[11px] text-right">OnHand</TableHead>
                      <TableHead className="text-[11px] text-right">Available</TableHead>
                      <TableHead className="text-[11px]">Warehouse</TableHead>
                      <TableHead className="text-[11px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockOverview.map((stk) => (
                      <TableRow key={stk.id} className="text-xs hover:bg-muted/40">
                        <TableCell>
                          <div className="font-medium">{stk.product}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{stk.sku}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatNumber(stk.stockInHand)}</TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatNumber(stk.available)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{stk.warehouse}</TableCell>
                        <TableCell>
                          {stk.available <= stk.reorderLevel ? (
                            <Badge variant="destructive" className="text-[10px]">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Section 19: Recent Warehouse Activity Stream */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Recent Warehouse Activity</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Chronological log of receipts, quality inspections, delays reported, and stock movements.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[11px]">Activity</TableHead>
                    <TableHead className="text-[11px]">Reference / Details</TableHead>
                    <TableHead className="text-[11px]">User</TableHead>
                    <TableHead className="text-[11px] text-right">Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.slice(0, 5).map((log) => (
                    <TableRow key={log.id} className="text-xs hover:bg-muted/40">
                      <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold">{log.referenceId}</span>
                        <span className="text-muted-foreground text-xs ml-2">({log.newValue})</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.user}</TableCell>
                      <TableCell className="text-right font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {log.dateTime}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
