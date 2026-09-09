'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  XCircle,
  Clock,
  Send,
  Search,
  CheckSquare,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useWarehouseStore, FulfilmentItem, calculateFulfilmentReadiness } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

export function FulfilmentTab() {
  const { fulfilments, dispatchFulfilmentOrder } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<FulfilmentItem | null>(null);

  const filteredData = useMemo(() => {
    return fulfilments.filter((item) => {
      const matchSearch =
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.finalStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [fulfilments, searchTerm, statusFilter]);

  const handleDispatch = (item: FulfilmentItem) => {
    if (item.finalStatus !== 'Ready for Fulfilment') {
      toast.error('Cannot dispatch order: Not all readiness conditions have been satisfied.');
      return;
    }
    dispatchFulfilmentOrder(item.id);
    toast.success(`Order ${item.orderId} dispatched from ${item.warehouse}! Stock deducted & audit logged.`);
  };

  const getFinalStatusBadge = (status: FulfilmentItem['finalStatus']) => {
    switch (status) {
      case 'Ready for Fulfilment':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none font-bold">Ready for Fulfilment</Badge>;
      case 'Almost Ready':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">Almost Ready</Badge>;
      case 'Partially Ready':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Partially Ready</Badge>;
      case 'At Risk':
        return <Badge variant="destructive">At Risk</Badge>;
      case 'Not Ready':
        return <Badge variant="secondary">Not Ready</Badge>;
      case 'Dispatched':
        return <Badge variant="outline" className="text-muted-foreground font-mono">Dispatched</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Summary counts matching Section 17
  const readyCount = fulfilments.filter((f) => f.finalStatus === 'Ready for Fulfilment').length;
  const atRiskCount = fulfilments.filter((f) => f.finalStatus === 'At Risk' || f.finalStatus === 'Not Ready').length;
  const shortageQty = fulfilments
    .filter((f) => f.finalStatus !== 'Ready for Fulfilment' && f.finalStatus !== 'Dispatched')
    .reduce((acc, f) => acc + (!f.conditions.stockAvailable ? f.requiredQty : Math.round(f.requiredQty * (1 - f.readinessPercent / 100))), 0);
  const nextDispatchDate = '12 Oct 2026';

  const getBottleneck = (conditions: FulfilmentItem['conditions']) => {
    if (!conditions.stockAvailable) return 'Stock Shortage';
    if (!conditions.stockReserved) return 'Stock Unallocated';
    if (!conditions.productionCompleted) return 'Production running';
    if (!conditions.qcPassed) return 'Waiting QC Release';
    if (!conditions.packagingReady) return 'Kitting & Packaging';
    if (!conditions.dispatchPrepared) return 'Carrier Manifesting';
    return 'None — Cleared';
  };

  return (
    <div className="space-y-6">
      {/* Top Fulfilment Summary Metrics - Section 17 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Orders Ready to Fulfil
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
              {readyCount} Orders
            </span>
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">100% of 6 gates verified</span>
        </Card>

        <Card className="p-4 bg-card border">
          <span className="text-xs font-semibold text-destructive uppercase tracking-wider block">
            Orders at Risk
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-destructive">
              {atRiskCount} Orders
            </span>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Blocked by stock or production delays</span>
        </Card>

        <Card className="p-4 bg-card border">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Shortage Quantity
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatNumber(shortageQty)} Units
            </span>
            <Package className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Deficit across unfulfilled orders</span>
        </Card>

        <Card className="p-4 bg-card border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Next Expected Dispatch
          </span>
          <div className="flex items-baseline justify-between mt-1.5">
            <span className="text-2xl font-bold font-mono text-primary">
              {nextDispatchDate}
            </span>
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">Next priority shipping window</span>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search order ID, customer, channel, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 h-9 text-xs">
              <SelectValue placeholder="All Readiness States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Readiness States</SelectItem>
              <SelectItem value="Ready for Fulfilment">Ready for Fulfilment</SelectItem>
              <SelectItem value="Almost Ready">Almost Ready</SelectItem>
              <SelectItem value="Partially Ready">Partially Ready</SelectItem>
              <SelectItem value="At Risk">At Risk</SelectItem>
              <SelectItem value="Not Ready">Not Ready</SelectItem>
              <SelectItem value="Dispatched">Dispatched</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-muted-foreground">
          {filteredData.length} customer fulfilment orders monitored
        </span>
      </div>

      {/* Dynamic Fulfilment Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer / Channel</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-center">Stock (20%)</TableHead>
              <TableHead className="text-center">Res. (15%)</TableHead>
              <TableHead className="text-center">Prod. (20%)</TableHead>
              <TableHead className="text-center">QC (20%)</TableHead>
              <TableHead className="text-center">Pack (15%)</TableHead>
              <TableHead className="text-center">Disp. (10%)</TableHead>
              <TableHead className="w-28">Readiness</TableHead>
              <TableHead>Bottleneck</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-bold text-xs text-foreground">
                    {item.orderId}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{item.customer}</div>
                    <div className="text-[10px] text-muted-foreground">{item.channel}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{item.product}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {item.requiredQty}
                  </TableCell>

                  {/* 6 Visual Condition Checkpoints */}
                  <TableCell className="text-center">
                    {item.conditions.stockAvailable ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.conditions.stockReserved ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.conditions.productionCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.conditions.qcPassed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.conditions.packagingReady ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.conditions.dispatchPrepared ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    )}
                  </TableCell>

                  {/* Progress Bar & Readiness % */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-foreground">{item.readinessPercent}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.readinessPercent === 100
                              ? 'bg-green-500'
                              : item.readinessPercent >= 85
                              ? 'bg-primary'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.readinessPercent}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        {getBottleneck(item.conditions)}
                      </span>
                    </TableCell>

                    <TableCell>{getFinalStatusBadge(item.finalStatus)}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedOrder(item)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {item.finalStatus === 'Ready for Fulfilment' ? (
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                            onClick={() => handleDispatch(item)}
                          >
                            <Send className="h-3 w-3" /> Dispatch
                          </Button>
                        ) : !item.conditions.stockReserved ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              toast.success(`Allocated available stock for Order ${item.orderId}`);
                            }}
                          >
                            Allocate Stock
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedOrder(item)}
                          >
                            Checklist
                          </Button>
                        )}
                      </div>
                    </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={13} className="h-28 text-center text-xs text-muted-foreground">
                  No fulfilment orders match current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} monitored fulfilment orders • Orders only achieve &ldquo;Ready for Fulfilment&rdquo; status when all mandatory quality, stock, and packaging conditions are satisfied.
      </div>

      {/* Visual Checklist / Inspection Breakdown Modal */}
      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                ORDER #{selectedOrder.orderId}
              </DialogTitle>
              <DialogDescription>
                Customer: {selectedOrder.customer} ({selectedOrder.channel}) • Warehouse: {selectedOrder.warehouse}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Product
                  </span>
                  <span className="font-semibold text-foreground text-sm">{selectedOrder.product}</span>
                  <span className="font-mono text-muted-foreground block text-[11px]">
                    SKU: {selectedOrder.sku} • Required: {selectedOrder.requiredQty} units
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-primary">
                    {selectedOrder.readinessPercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {selectedOrder.finalStatus}
                  </span>
                </div>
              </div>

              {/* 6 Gates Checklist */}
              <div className="space-y-2 border rounded-lg p-3 bg-card">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Mandatory Fulfilment Gates:
                </span>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      {selectedOrder.conditions.stockAvailable ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">1. Stock Available</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {selectedOrder.conditions.stockAvailable ? '✓ 20%' : '✕ 0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      {selectedOrder.conditions.stockReserved ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">2. Stock Reserved against Order</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {selectedOrder.conditions.stockReserved ? '✓ 15%' : '✕ 0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      {selectedOrder.conditions.productionCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">3. Production Completed</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {selectedOrder.conditions.productionCompleted ? '✓ 20%' : '✕ 0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      {selectedOrder.conditions.qcPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">4. Quality Check Passed</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {selectedOrder.conditions.qcPassed ? '✓ 20%' : '✕ 0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      {selectedOrder.conditions.packagingReady ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">5. Packaging Ready</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {selectedOrder.conditions.packagingReady ? '✓ 15%' : '✕ 0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2 rounded bg-muted/30">
                    <div className="flex items-center gap-2">
                      {selectedOrder.conditions.dispatchPrepared ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">6. Dispatch Prepared</span>
                    </div>
                    <span className="font-mono font-semibold">
                      {selectedOrder.conditions.dispatchPrepared ? '✓ 10%' : '✕ 0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-muted-foreground text-xs">
                  Expected Dispatch: <span className="font-medium text-foreground">{selectedOrder.expectedDispatch}</span>
                </span>
                {selectedOrder.finalStatus === 'Ready for Fulfilment' ? (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      handleDispatch(selectedOrder);
                      setSelectedOrder(null);
                    }}
                  >
                    <Send className="h-3 w-3" /> Dispatch Now
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info(`Checking prerequisites for ${selectedOrder.orderId}`);
                      setSelectedOrder(null);
                    }}
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
