'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Boxes,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  Package,
  Search,
  SlidersHorizontal,
  Plus,
  RotateCcw,
  PackageCheck,
  Building,
  ArrowRight,
  Download,
} from 'lucide-react';
import {
  useWarehouseStore,
  StockItem,
  IncomingStockItem,
  ReservationItem,
  TransferItem,
  StockMovementItem,
} from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface StockTabProps {
  onOpenAdjust: (item?: StockItem) => void;
  onOpenTransfer: () => void;
  onViewHistory?: (item: StockItem) => void;
  initialSubView?: string;
}

export function StockTab({
  onOpenAdjust,
  onOpenTransfer,
  onViewHistory,
  initialSubView = 'stock-in-hand',
}: StockTabProps) {
  const {
    stock,
    incomingStock,
    reservations,
    transfers,
    stockMovements,
    receiveIncomingAtDock,
    releaseReservation,
    receiveTransfer,
  } = useWarehouseStore();

  const [activeSubView, setActiveSubView] = useState(initialSubView);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Summary Metrics
  const totalStockInHand = stock.reduce((acc, s) => acc + s.stockInHand, 0);
  const totalAvailable = stock.reduce((acc, s) => acc + s.available, 0);
  const totalReserved = stock.reduce((acc, s) => acc + s.reserved, 0);
  const totalIncoming = stock.reduce((acc, s) => acc + s.incoming, 0);
  const lowStockCount = stock.filter((s) => s.status === 'Low Stock').length;
  const outOfStockCount = stock.filter((s) => s.status === 'Out of Stock' || s.status === 'Critical').length;

  // Filtered Stock Table
  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      const matchSearch =
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase());

      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;
      const matchCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'Apparel' &&
          (item.product.toLowerCase().includes('hoodie') ||
            item.product.toLowerCase().includes('t-shirt') ||
            item.product.toLowerCase().includes('jacket') ||
            item.product.toLowerCase().includes('cargo'))) ||
        (categoryFilter === 'Accessories' &&
          (item.product.toLowerCase().includes('cap') ||
            item.product.toLowerCase().includes('tote') ||
            item.product.toLowerCase().includes('beanie'))) ||
        (categoryFilter === 'Packaging' &&
          (item.product.toLowerCase().includes('box') ||
            item.product.toLowerCase().includes('poly') ||
            item.product.toLowerCase().includes('bag')));

      let matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      if (activeSubView === 'available-stock') {
        matchStatus = item.available > 0;
      }

      return matchSearch && matchWarehouse && matchCategory && matchStatus;
    });
  }, [stock, searchTerm, warehouseFilter, categoryFilter, statusFilter, activeSubView]);

  // Filtered Incoming Stock
  const filteredIncoming = useMemo(() => {
    return incomingStock.filter((item) => {
      const matchSearch =
        item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierManufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;
      return matchSearch && matchWarehouse;
    });
  }, [incomingStock, searchTerm, warehouseFilter]);

  // Filtered Reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((item) => {
      const matchSearch =
        item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;
      return matchSearch && matchWarehouse;
    });
  }, [reservations, searchTerm, warehouseFilter]);

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fromWarehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toWarehouse.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [transfers, searchTerm]);

  // Filtered Stock Movements
  const filteredMovements = useMemo(() => {
    return stockMovements.filter((item) => {
      const matchSearch =
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;
      return matchSearch && matchWarehouse;
    });
  }, [stockMovements, searchTerm, warehouseFilter]);

  const getStatusBadge = (status: StockItem['status']) => {
    switch (status) {
      case 'Healthy':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Healthy</Badge>;
      case 'Low Stock':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Low Stock</Badge>;
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'Out of Stock':
        return <Badge variant="destructive" className="font-bold">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const exportStockCSV = () => {
    const headers = ['Product', 'SKU', 'Warehouse', 'Stock in Hand', 'Reserved', 'Available', 'Incoming', 'Reorder Level', 'Status', 'Last Updated'];
    const rows = filteredStock.map((s) => [
      `"${s.product}"`,
      s.sku,
      `"${s.warehouse}"`,
      s.stockInHand,
      s.reserved,
      s.available,
      s.incoming,
      s.reorderLevel,
      s.status,
      s.lastUpdated,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_levels_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory report exported');
  };

  return (
    <div className="space-y-6">
      {/* 6 Stock Module KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-card border p-3 cursor-pointer hover:border-primary/50 transition-all" onClick={() => setActiveSubView('stock-in-hand')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Stock in Hand</span>
            <Boxes className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{formatNumber(totalStockInHand)}</p>
          <span className="text-[10px] text-muted-foreground">Total physical units</span>
        </Card>

        <Card className="bg-card border p-3 cursor-pointer hover:border-green-500/50 transition-all" onClick={() => setActiveSubView('available-stock')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase">Available</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-xl font-bold font-mono text-green-600 dark:text-green-400 mt-1">{formatNumber(totalAvailable)}</p>
          <span className="text-[10px] text-muted-foreground">Unreserved stock</span>
        </Card>

        <Card className="bg-card border p-3 cursor-pointer hover:border-amber-500/50 transition-all" onClick={() => setActiveSubView('reservations')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Reserved</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground mt-1">{formatNumber(totalReserved)}</p>
          <span className="text-[10px] text-muted-foreground">Locked for orders</span>
        </Card>

        <Card className="bg-card border p-3 cursor-pointer hover:border-primary/50 transition-all" onClick={() => setActiveSubView('incoming-stock')}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">Incoming</span>
            <Truck className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">+{formatNumber(totalIncoming)}</p>
          <span className="text-[10px] text-muted-foreground">Expected arrivals</span>
        </Card>

        <Card className="bg-card border p-3 cursor-pointer hover:border-amber-500/50 transition-all" onClick={() => { setActiveSubView('stock-in-hand'); setStatusFilter('Low Stock'); }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Low Stock</span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{lowStockCount} SKUs</p>
          <span className="text-[10px] text-muted-foreground">Below reorder</span>
        </Card>

        <Card className="bg-card border p-3 cursor-pointer hover:border-destructive/50 transition-all" onClick={() => { setActiveSubView('stock-in-hand'); setStatusFilter('Out of Stock'); }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-destructive uppercase">Out of Stock</span>
            <Package className="h-3.5 w-3.5 text-destructive" />
          </div>
          <p className="text-xl font-bold font-mono text-destructive mt-1">{outOfStockCount} SKUs</p>
          <span className="text-[10px] text-muted-foreground">Critical deficit</span>
        </Card>
      </div>

      {/* Internal Sub-View Navigation (Inside Stock) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'stock-in-hand', label: 'Stock in Hand' },
            { id: 'available-stock', label: 'Available Stock' },
            { id: 'reservations', label: `Reservations (${reservations.length})` },
            { id: 'incoming-stock', label: `Incoming Stock (${incomingStock.length})` },
            { id: 'transfers', label: `Stock Transfers (${transfers.length})` },
            { id: 'stock-movements', label: 'Stock Movements' },
            { id: 'warehouse-wise', label: 'Warehouse-wise Inventory' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeSubView === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSubView(tab.id)}
              className="text-xs h-8 px-3 rounded-md font-medium transition-all"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onOpenAdjust()} className="gap-1.5 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" /> + Stock Adjustment
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenTransfer} className="gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Transfer Stock
          </Button>
          {(activeSubView === 'stock-in-hand' || activeSubView === 'available-stock') && (
            <Button variant="outline" size="sm" onClick={exportStockCSV} className="gap-1 text-xs">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 w-full sm:w-72 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search by product, SKU, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Warehouses</SelectItem>
              <SelectItem value="Central Hub - BLR">Central Hub - BLR</SelectItem>
              <SelectItem value="North DC - DEL">North DC - DEL</SelectItem>
              <SelectItem value="West DC - BOM">West DC - BOM</SelectItem>
            </SelectContent>
          </Select>

          {(activeSubView === 'stock-in-hand' || activeSubView === 'available-stock') && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Apparel">Apparel</SelectItem>
                <SelectItem value="Accessories">Accessories</SelectItem>
                <SelectItem value="Packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>
          )}

          {(activeSubView === 'stock-in-hand' || activeSubView === 'available-stock') && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="All Stock Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="Healthy">Healthy</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-mono bg-muted/40 px-2.5 py-1 rounded border">
          Available Stock = Stock in Hand - Reserved Stock
        </div>
      </div>

      {/* SUB-VIEW 1 & 2: Stock in Hand / Available Stock Table */}
      {(activeSubView === 'stock-in-hand' || activeSubView === 'available-stock') && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Stock in Hand</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available Stock</TableHead>
                <TableHead className="text-right">Incoming</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.length > 0 ? (
                filteredStock.map((item) => {
                  const isLow = item.available <= item.reorderLevel;
                  const isOut = item.available <= 0;
                  return (
                    <TableRow
                      key={item.id}
                      className={`transition-colors ${
                        isOut
                          ? 'bg-destructive/10 hover:bg-destructive/15 border-l-2 border-l-destructive'
                          : isLow
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-2 border-l-amber-500'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          {item.product}
                          {isOut ? (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">OUT</Badge>
                          ) : isLow ? (
                            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] px-1 py-0 h-4 border-none">LOW</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                      <TableCell className="text-xs">{item.warehouse}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-foreground">
                        {formatNumber(item.stockInHand)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {formatNumber(item.reserved)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs">
                        <span
                          className={
                            item.available <= 0
                              ? 'text-destructive font-extrabold'
                              : item.available <= item.reorderLevel
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-green-600 dark:text-green-400'
                          }
                        >
                          {formatNumber(item.available)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-blue-600 dark:text-blue-400">
                        +{formatNumber(item.incoming)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {formatNumber(item.reorderLevel)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 px-2"
                            onClick={() => onOpenAdjust(item)}
                          >
                            <SlidersHorizontal className="h-3 w-3" /> Adjust
                          </Button>
                          {onViewHistory && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => onViewHistory(item)}
                            >
                              <Clock className="h-3 w-3" /> History
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-28 text-center text-xs text-muted-foreground">
                    No inventory records match current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* SUB-VIEW 3: Reservations */}
      {activeSubView === 'reservations' && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Product & SKU</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Required Qty</TableHead>
                <TableHead className="text-right">Reserved Qty</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.length > 0 ? (
                filteredReservations.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-semibold text-xs text-foreground">{item.orderId}</TableCell>
                    <TableCell className="text-xs font-medium">{item.customer}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{item.channel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs text-foreground">{item.product}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-xs">{item.warehouse}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{item.requiredQty}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-primary">{item.reservedQty}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">{formatNumber(item.available)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'Allocated' ? 'default' : item.status === 'Backordered' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'Allocated' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            releaseReservation(item.id);
                            toast.success(`Released reservation for ${item.orderId}`);
                          }}
                        >
                          <RotateCcw className="h-3 w-3" /> Release
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-28 text-center text-xs text-muted-foreground">
                    No stock reservations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* SUB-VIEW 4: Incoming Stock */}
      {activeSubView === 'incoming-stock' && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Supplier / Manufacturer</TableHead>
                <TableHead>Product & SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Expected Arrival</TableHead>
                <TableHead>Destination Hub</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncoming.length > 0 ? (
                filteredIncoming.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-semibold text-xs text-foreground">{item.referenceId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{item.source}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{item.supplierManufacturer}</TableCell>
                    <TableCell>
                      <div className="font-medium text-xs text-foreground">{item.product}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      +{formatNumber(item.quantity)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.expectedArrival}</TableCell>
                    <TableCell className="text-xs">{item.warehouse}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'Dock Arrived' ? 'default' : item.status === 'Delayed' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status !== 'Dock Arrived' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            receiveIncomingAtDock(item.id);
                            toast.success(`Received ${item.referenceId} at ${item.warehouse} dock.`);
                          }}
                        >
                          <PackageCheck className="h-3 w-3" /> Receive Dock
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Docked</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-28 text-center text-xs text-muted-foreground">
                    No incoming shipments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* SUB-VIEW 5: Stock Transfers */}
      {activeSubView === 'transfers' && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>From Facility</TableHead>
                <TableHead>To Facility</TableHead>
                <TableHead>Product & SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Transfer Date</TableHead>
                <TableHead>Expected Arrival</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-semibold text-xs text-foreground">{item.id}</TableCell>
                    <TableCell className="text-xs">{item.fromWarehouse}</TableCell>
                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        {item.toWarehouse}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs text-foreground">{item.product}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">{formatNumber(item.quantity)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.transferDate}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.expectedArrival}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'Received' ? 'default' : item.status === 'In Transit' ? 'secondary' : 'outline'}
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'In Transit' || item.status === 'Approved' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            receiveTransfer(item.id);
                            toast.success(`Transfer ${item.id} received at ${item.toWarehouse}`);
                          }}
                        >
                          <PackageCheck className="h-3 w-3" /> Receive
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-28 text-center text-xs text-muted-foreground">
                    No transfers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* SUB-VIEW 6: Stock Movements (Immutable Audit Trail) */}
      {activeSubView === 'stock-movements' && (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Movement ID</TableHead>
                <TableHead>Product & SKU</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Movement Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Qty In</TableHead>
                <TableHead className="text-right">Qty Out</TableHead>
                <TableHead className="text-right">Previous</TableHead>
                <TableHead className="text-right">New Level</TableHead>
                <TableHead>Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length > 0 ? (
                filteredMovements.map((mov) => {
                  const isPositive = mov.qtyIn > 0;
                  return (
                    <TableRow key={mov.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">{mov.dateTime}</TableCell>
                      <TableCell className="font-mono font-semibold text-xs text-foreground">{mov.id}</TableCell>
                      <TableCell>
                        <div className="font-medium text-xs text-foreground">{mov.product}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{mov.sku}</div>
                      </TableCell>
                      <TableCell className="text-xs">{mov.warehouse}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{mov.movementType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{mov.referenceId}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs">
                        {isPositive ? (
                          <span className="text-green-600 dark:text-green-400">+{mov.qtyIn}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs">
                        {mov.qtyOut > 0 ? (
                          <span className="text-destructive">-{mov.qtyOut}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{formatNumber(mov.previousStock)}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-xs text-foreground">{formatNumber(mov.newStock)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{mov.performedBy}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-28 text-center text-xs text-muted-foreground">
                    No movement records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* SUB-VIEW 7: Warehouse-wise Inventory Breakdown */}
      {activeSubView === 'warehouse-wise' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Central Hub - BLR', 'North DC - DEL', 'West DC - BOM'].map((whName) => {
            const whItems = stock.filter((s) => s.warehouse === whName);
            const whOnHand = whItems.reduce((acc, s) => acc + s.stockInHand, 0);
            const whAvail = whItems.reduce((acc, s) => acc + s.available, 0);
            const whRes = whItems.reduce((acc, s) => acc + s.reserved, 0);

            return (
              <Card key={whName} className="p-4 space-y-3 border bg-card">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-primary" /> {whName}
                    </h4>
                    <span className="text-[11px] text-muted-foreground">{whItems.length} SKUs stocked</span>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">Active Facility</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-muted/40 rounded-lg border font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">In-Hand</span>
                    <span className="font-bold text-sm text-foreground">{formatNumber(whOnHand)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-green-600 dark:text-green-400 block">Available</span>
                    <span className="font-bold text-sm text-green-600 dark:text-green-400">{formatNumber(whAvail)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block">Reserved</span>
                    <span className="font-bold text-sm text-muted-foreground">{formatNumber(whRes)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                    Top Inventory at Facility:
                  </span>
                  {whItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-muted/30">
                      <div className="truncate max-w-[170px]">
                        <span className="font-medium text-foreground">{item.product}</span>
                      </div>
                      <span className="font-mono font-semibold">{item.available} avail</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setWarehouseFilter(whName);
                    setActiveSubView('stock-in-hand');
                  }}
                >
                  View All {whName} Inventory
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
