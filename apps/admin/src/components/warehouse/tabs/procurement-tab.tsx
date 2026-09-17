'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Search,
  Plus,
  MoreHorizontal,
  PackageCheck,
  Eye,
  AlertTriangle,
  XCircle,
  Download,
  Package,
} from 'lucide-react';
import { useWarehouseStore, ProcurementItem } from '@/stores/warehouse';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface ProcurementTabProps {
  onOpenCreate: () => void;
}

export function ProcurementTab({ onOpenCreate }: ProcurementTabProps) {
  const { procurements, receiveProcurementStock, updateProcurementStatus } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Detail Modal state
  const [viewItem, setViewItem] = useState<ProcurementItem | null>(null);

  // Receive stock action
  const handleReceiveStock = (item: ProcurementItem) => {
    const pending = item.quantityOrdered - item.quantityReceived;
    if (pending <= 0) {
      toast.info('All units have already been received for this PO');
      return;
    }
    const input = window.prompt(
      `Receive stock for ${item.product} (${item.id})\nPending units: ${pending}\nEnter quantity to receive:`,
      (pending ?? 0).toString()
    );
    if (!input) return;
    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }
    receiveProcurementStock(item.id, qty);
    toast.success(`Received ${qty} units of ${item.sku} at ${item.destinationWarehouse}`);
  };

  const handleMarkDelayed = (item: ProcurementItem) => {
    updateProcurementStatus(item.id, 'Delayed');
    toast.warning(`PO ${item.id} flagged as Delayed`);
  };

  const handleCancel = (item: ProcurementItem) => {
    if (window.confirm(`Are you sure you want to cancel procurement order ${item.id}?`)) {
      updateProcurementStatus(item.id, 'Cancelled');
      toast.error(`PO ${item.id} cancelled`);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Procurement ID',
      'PO Number',
      'Supplier',
      'Product',
      'SKU',
      'Category',
      'Ordered',
      'Received',
      'Unit Cost',
      'Total Cost',
      'Order Date',
      'Expected Delivery',
      'Warehouse',
      'Owner',
      'Status',
    ];
    const rows = filteredData.map((p) => [
      p.id,
      p.purchaseOrderNumber,
      `"${p.supplier}"`,
      `"${p.product}"`,
      p.sku,
      p.category,
      p.quantityOrdered,
      p.quantityReceived,
      p.unitCost,
      p.totalCost,
      p.orderDate,
      p.expectedDeliveryDate,
      `"${p.destinationWarehouse}"`,
      `"${p.procurementOwner}"`,
      p.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procurement_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Procurement export downloaded');
  };

  const filteredData = useMemo(() => {
    return procurements.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.procurementOwner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchWarehouse = warehouseFilter === 'ALL' || item.destinationWarehouse === warehouseFilter;
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

      return matchSearch && matchStatus && matchWarehouse && matchCategory;
    });
  }, [procurements, searchTerm, statusFilter, warehouseFilter, categoryFilter]);

  const getStatusBadge = (status: ProcurementItem['status']) => {
    switch (status) {
      case 'Received':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Received</Badge>;
      case 'Partially Received':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">Partially Received</Badge>;
      case 'In Transit':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">In Transit</Badge>;
      case 'Confirmed':
        return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/15 border-none">Confirmed</Badge>;
      case 'PO Raised':
        return <Badge variant="secondary">PO Raised</Badge>;
      case 'Draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'Delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="text-muted-foreground line-through">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<ProcurementItem>[] = [
    {
      accessorKey: 'id',
      header: 'Procurement ID / PO#',
      cell: ({ row }) => (
        <div>
          <div className="font-mono font-semibold text-xs text-foreground">{row.original.id}</div>
          <div className="text-[10px] font-mono text-muted-foreground">{row.original.purchaseOrderNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => <span className="font-medium text-xs">{row.original.supplier}</span>,
    },
    {
      accessorKey: 'product',
      header: 'Material / Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-xs text-foreground">{row.original.product}</div>
          <div className="text-[11px] font-mono text-muted-foreground">{row.original.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px]">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: 'quantityOrdered',
      header: () => <div className="text-right">Ordered</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-semibold text-xs">
          {formatNumber(row.original.quantityOrdered)}
        </div>
      ),
    },
    {
      accessorKey: 'quantityReceived',
      header: () => <div className="text-right">Received</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-xs text-green-600 dark:text-green-400">
          {formatNumber(row.original.quantityReceived)}
        </div>
      ),
    },
    {
      accessorKey: 'totalCost',
      header: () => <div className="text-right">Total Cost</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono font-medium text-xs">
          {formatCurrency(row.original.totalCost, 'INR')}
        </div>
      ),
    },
    {
      accessorKey: 'expectedDeliveryDate',
      header: 'Delivery Date',
      cell: ({ row }) => <span className="text-xs text-muted-foreground whitespace-nowrap">{row.original.expectedDeliveryDate}</span>,
    },
    {
      accessorKey: 'destinationWarehouse',
      header: 'Destination',
      cell: ({ row }) => <span className="text-xs whitespace-nowrap">{row.original.destinationWarehouse}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewItem(item)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReceiveStock(item)}>
                  <PackageCheck className="mr-2 h-4 w-4 text-green-600" /> Receive Stock
                </DropdownMenuItem>
                {item.status !== 'Delayed' && item.status !== 'Received' && (
                  <DropdownMenuItem onClick={() => handleMarkDelayed(item)}>
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> Mark Delayed
                  </DropdownMenuItem>
                )}
                {item.status !== 'Cancelled' && item.status !== 'Received' && (
                  <DropdownMenuItem onClick={() => handleCancel(item)} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs filters */}
      <div className="flex border-b pb-px gap-6 text-sm font-medium overflow-x-auto whitespace-nowrap">
        {[
          { id: 'ALL', label: 'All Orders' },
          { id: 'PO Raised', label: 'PO Raised' },
          { id: 'Confirmed', label: 'Confirmed' },
          { id: 'In Transit', label: 'In Transit' },
          { id: 'Partially Received', label: 'Partially Received' },
          { id: 'Received', label: 'Received' },
          { id: 'Delayed', label: 'Delayed' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setStatusFilter(t.id)}
            className={`pb-3 border-b-2 transition-colors ${
              statusFilter === t.id
                ? 'border-primary text-foreground font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="flex items-center gap-2 w-full sm:w-72 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search PO#, supplier, SKU, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="Raw Materials">Raw Materials</SelectItem>
              <SelectItem value="Finished Goods">Finished Goods</SelectItem>
              <SelectItem value="Packaging">Packaging</SelectItem>
              <SelectItem value="Hardware & Trims">Hardware & Trims</SelectItem>
            </SelectContent>
          </Select>

          {/* Warehouse Filter */}
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Warehouses</SelectItem>
              <SelectItem value="Central Hub - BLR">Central Hub - BLR</SelectItem>
              <SelectItem value="North DC - DEL">North DC - DEL</SelectItem>
              <SelectItem value="West DC - BOM">West DC - BOM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button onClick={onOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" /> New Procurement
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center border rounded-xl bg-card py-24 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No procurement orders found</h2>
            <p className="text-muted-foreground max-w-[400px]">
              {statusFilter === 'ALL'
                ? 'No procurement orders have been created yet.'
                : `There are currently no procurement orders with the "${statusFilter}" status.`}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
          />
        )}
      </div>

      {/* Procurement Details Dialog */}
      {viewItem && (
        <Dialog open={Boolean(viewItem)} onOpenChange={() => setViewItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Procurement Order: {viewItem.id}</DialogTitle>
              <DialogDescription>
                PO: {viewItem.purchaseOrderNumber} • Ordered on {viewItem.orderDate}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Supplier:</span>
                  <span className="font-semibold text-foreground">{viewItem.supplier}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Category:</span>
                  <span>{viewItem.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Product / Material:</span>
                  <span className="font-semibold">{viewItem.product}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">SKU:</span>
                  <span className="font-mono">{viewItem.sku}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-muted/20 rounded-lg border text-center font-mono">
                <div>
                  <span className="text-muted-foreground text-[10px] block uppercase">Ordered</span>
                  <span className="font-bold text-sm text-foreground">{formatNumber(viewItem.quantityOrdered)}</span>
                </div>
                <div>
                  <span className="text-green-600 dark:text-green-400 text-[10px] block uppercase">Received</span>
                  <span className="font-bold text-sm text-green-600 dark:text-green-400">
                    {formatNumber(viewItem.quantityReceived)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block uppercase">Unit Cost</span>
                  <span className="font-bold text-sm text-foreground">{formatCurrency(viewItem.unitCost, 'INR')}</span>
                </div>
              </div>

              <div className="space-y-1 p-3 rounded-lg border text-muted-foreground">
                <div className="flex justify-between">
                  <span>Destination Warehouse:</span>
                  <span className="font-medium text-foreground">{viewItem.destinationWarehouse}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Delivery:</span>
                  <span className="font-medium text-foreground">{viewItem.expectedDeliveryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Procurement Owner:</span>
                  <span className="font-medium text-foreground">{viewItem.procurementOwner}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t text-foreground">
                  <span>Total PO Cost:</span>
                  <span className="font-mono">{formatCurrency(viewItem.totalCost, 'INR')}</span>
                </div>
              </div>

              {viewItem.notes && (
                <div className="p-3 bg-muted/30 rounded-lg border text-muted-foreground italic">
                  &ldquo;{viewItem.notes}&rdquo;
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
