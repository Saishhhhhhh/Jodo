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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  ChevronDown,
  CheckCircle2,
  Truck,
  FileText,
  RotateCcw,
  History,
  User,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useWarehouseStore, ProcurementItem } from '@/stores/warehouse';
import { warehouseApi } from '@/lib/api-client';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { ReceiveStockDialog } from '../modals/receive-stock-dialog';
import { EditProcurementDrawer } from '../modals/edit-procurement-drawer';

interface ProcurementTabProps {
  onOpenCreate: () => void;
}

export function ProcurementTab({ onOpenCreate }: ProcurementTabProps) {
  const { procurements, receiveProcurementStock, updateProcurementStatus, deleteProcurement } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Detail Modal state
  const [viewItem, setViewItem] = useState<ProcurementItem | null>(null);

  // Edit PO Drawer state
  const [editItem, setEditItem] = useState<ProcurementItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Delete Confirm Dialog state
  const [deleteItem, setDeleteItem] = useState<ProcurementItem | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Receive Stock Dialog state
  const [receiveItemId, setReceiveItemId] = useState<string | null>(null);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  // Cancel Confirm Dialog state
  const [cancelItem, setCancelItem] = useState<ProcurementItem | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Dynamically resolved from store so updates immediately reflect
  const activeReceiveItem = procurements.find((p) => p.id === receiveItemId) || null;
  const activeViewItem = viewItem ? (procurements.find((p) => p.id === viewItem.id) || viewItem) : null;
  const activeEditItem = editItem ? (procurements.find((p) => p.id === editItem.id) || editItem) : null;

  // Receive stock action — opens theme-matched Jodo dialog
  const handleReceiveStock = (item: ProcurementItem) => {
    setReceiveItemId(item.id);
    setIsReceiveOpen(true);
  };

  const handleMarkDelayed = (item: ProcurementItem) => {
    updateProcurementStatus(item.id, 'Delayed');
    toast.warning(`PO ${item.id} flagged as Delayed`);
  };

  const handleCancel = (item: ProcurementItem) => {
    setCancelItem(item);
    setIsCancelConfirmOpen(true);
  };

  const confirmCancel = () => {
    if (cancelItem) {
      updateProcurementStatus(cancelItem.id, 'Cancelled');
      toast.error(`PO ${cancelItem.id} cancelled`);
      setIsCancelConfirmOpen(false);
      setCancelItem(null);
    }
  };

  const confirmDelete = async () => {
    if (deleteItem) {
      const poLabel = deleteItem.purchaseOrderNumber || deleteItem.id;
      deleteProcurement(deleteItem.id);
      try {
        await warehouseApi.deleteProcurement(deleteItem.id);
      } catch {}
      toast.success(`Purchase Order ${poLabel} has been permanently deleted`);
      setIsDeleteConfirmOpen(false);
      setDeleteItem(null);
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
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="cursor-pointer group inline-flex items-center gap-1 focus:outline-none hover:opacity-85 transition-opacity"
                title="Click to update order status"
              >
                {getStatusBadge(item.status)}
                <ChevronDown className="h-3 w-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Update Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  updateProcurementStatus(item.id, 'PO Raised');
                  toast.success(`PO ${item.id} status changed to "PO Raised"`);
                }}
              >
                <FileText className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                <span>PO Raised</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  updateProcurementStatus(item.id, 'Confirmed');
                  toast.success(`PO ${item.id} confirmed by supplier`);
                }}
              >
                <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-purple-400" />
                <span>Confirmed</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  updateProcurementStatus(item.id, 'In Transit');
                  toast.success(`PO ${item.id} marked In Transit`);
                }}
              >
                <Truck className="mr-2 h-3.5 w-3.5 text-amber-400" />
                <span>In Transit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  updateProcurementStatus(item.id, 'Received');
                  toast.success(`PO ${item.id} marked as Received`);
                }}
              >
                <PackageCheck className="mr-2 h-3.5 w-3.5 text-green-400" />
                <span>Received</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  updateProcurementStatus(item.id, 'Delayed');
                  toast.warning(`PO ${item.id} flagged Delayed`);
                }}
              >
                <AlertTriangle className="mr-2 h-3.5 w-3.5 text-amber-500" />
                <span>Delayed</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  updateProcurementStatus(item.id, 'Cancelled');
                  toast.error(`PO ${item.id} cancelled`);
                }}
                className="text-destructive"
              >
                <XCircle className="mr-2 h-3.5 w-3.5" />
                <span>Cancelled</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setViewItem(item)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setEditItem(item);
                    setIsEditOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4 text-primary" /> Edit PO
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Quick Status Actions */}
                {item.status === 'PO Raised' && (
                  <DropdownMenuItem
                    onClick={() => {
                      updateProcurementStatus(item.id, 'Confirmed');
                      toast.success(`PO ${item.id} confirmed`);
                    }}
                    className="text-purple-400 font-medium"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-purple-400" />
                    <span>Confirm Order</span>
                  </DropdownMenuItem>
                )}

                {item.status === 'Confirmed' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        updateProcurementStatus(item.id, 'In Transit');
                        toast.success(`PO ${item.id} marked In Transit`);
                      }}
                      className="text-amber-400 font-medium"
                    >
                      <Truck className="mr-2 h-4 w-4 text-amber-400" />
                      <span>Mark In Transit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        updateProcurementStatus(item.id, 'PO Raised');
                        toast.info(`PO ${item.id} reverted to "PO Raised"`);
                      }}
                    >
                      <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Revert to PO Raised</span>
                    </DropdownMenuItem>
                  </>
                )}

                {item.status !== 'PO Raised' && item.status !== 'Confirmed' && (
                  <DropdownMenuItem
                    onClick={() => {
                      updateProcurementStatus(item.id, 'PO Raised');
                      toast.info(`PO ${item.id} set to "PO Raised"`);
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Set to PO Raised</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={() => handleReceiveStock(item)}>
                  <PackageCheck className="mr-2 h-4 w-4 text-green-600" /> Receive Stock
                </DropdownMenuItem>
                {item.status !== 'Delayed' && item.status !== 'Received' && (
                  <DropdownMenuItem onClick={() => handleMarkDelayed(item)}>
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> Mark Delayed
                  </DropdownMenuItem>
                )}
                {item.status !== 'Cancelled' && item.status !== 'Received' && (
                  <DropdownMenuItem onClick={() => handleCancel(item)} className="text-amber-500">
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    setDeleteItem(item);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete PO
                </DropdownMenuItem>
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
      {/* Procurement Details Dialog */}
      {(() => {
        const selectedItem = viewItem ? procurements.find((p) => p.id === viewItem.id) || viewItem : null;
        if (!selectedItem) return null;

        return (
          <Dialog open={Boolean(viewItem)} onOpenChange={() => setViewItem(null)}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Procurement Order: {selectedItem.id}</DialogTitle>
                <DialogDescription>
                  PO: {selectedItem.purchaseOrderNumber} • Ordered on {selectedItem.orderDate}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2 text-xs">
                {/* Order Status Update Row */}
                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px] font-medium">Status:</span>
                    {getStatusBadge(selectedItem.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px]">Update:</span>
                    <Select
                      value={selectedItem.status}
                      onValueChange={(newStatus: ProcurementItem['status']) => {
                        updateProcurementStatus(selectedItem.id, newStatus);
                        setViewItem({ ...selectedItem, status: newStatus });
                        toast.success(`PO ${selectedItem.id} status changed to "${newStatus}"`);
                      }}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PO Raised">PO Raised</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="In Transit">In Transit</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Delayed">Delayed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg border">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Supplier:</span>
                    <span className="font-semibold text-foreground">{selectedItem.supplier}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Category:</span>
                    <span>{selectedItem.category}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Product / Material:</span>
                    <span className="font-semibold">{selectedItem.product}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">SKU:</span>
                    <span className="font-mono">{selectedItem.sku}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/20 rounded-lg border text-center font-mono">
                  <div>
                    <span className="text-muted-foreground text-[10px] block uppercase">Ordered</span>
                    <span className="font-bold text-sm text-foreground">{formatNumber(selectedItem.quantityOrdered)}</span>
                  </div>
                  <div>
                    <span className="text-green-600 dark:text-green-400 text-[10px] block uppercase">Received</span>
                    <span className="font-bold text-sm text-green-600 dark:text-green-400">
                      {formatNumber(selectedItem.quantityReceived)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block uppercase">Unit Cost</span>
                    <span className="font-bold text-sm text-foreground">{formatCurrency(selectedItem.unitCost, 'INR')}</span>
                  </div>
                </div>

                <div className="space-y-1 p-3 rounded-lg border text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Destination Warehouse:</span>
                    <span className="font-medium text-foreground">{selectedItem.destinationWarehouse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Delivery:</span>
                    <span className="font-medium text-foreground">{selectedItem.expectedDeliveryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Procurement Owner:</span>
                    <span className="font-medium text-foreground">{selectedItem.procurementOwner}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t text-foreground">
                    <span>Total PO Cost:</span>
                    <span className="font-mono">{formatCurrency(selectedItem.totalCost, 'INR')}</span>
                  </div>
                </div>

                {selectedItem.notes && (
                  <div className="p-3 bg-muted/30 rounded-lg border text-muted-foreground italic">
                    &ldquo;{selectedItem.notes}&rdquo;
                  </div>
                )}

                {/* Receipt History & Batch Records Section in View Details */}
                <div className="space-y-2.5 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                      <History className="h-3.5 w-3.5 text-primary" />
                      <span>Receipt History & Batches ({selectedItem.receiptHistory?.length || 0})</span>
                    </div>
                    {selectedItem.quantityOrdered > selectedItem.quantityReceived && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => {
                          handleReceiveStock(selectedItem);
                        }}
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        <span>Receive Stock</span>
                      </Button>
                    )}
                  </div>

                  {selectedItem.receiptHistory && selectedItem.receiptHistory.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden bg-card divide-y">
                      {selectedItem.receiptHistory.map((rec) => (
                        <div key={rec.id} className="p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-muted/30 transition-colors">
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-mono">
                                +{formatNumber(rec.receivedQty)} units
                              </Badge>
                              <span className="text-[11px] text-muted-foreground font-mono">{rec.id}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{rec.notes}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 sm:justify-end">
                              <Clock className="h-3 w-3" />
                              <span>{rec.receivedAt}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 sm:justify-end mt-0.5">
                              <User className="h-2.5 w-2.5" />
                              <span>{rec.receivedBy}</span>
                              <span>•</span>
                              <span className="font-mono font-semibold text-amber-500">
                                {formatNumber(rec.remainingQty)} pending
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-[11px] text-muted-foreground rounded-lg border bg-muted/20">
                      No delivery receipts recorded yet for this order.
                    </div>
                  )}
                </div>

                {/* View Details Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      setDeleteItem(selectedItem);
                      setIsDeleteConfirmOpen(true);
                      setViewItem(null);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete PO</span>
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => {
                        setEditItem(selectedItem);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 text-primary" />
                      <span>Edit PO</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setViewItem(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* Themed Edit Procurement Drawer */}
      <EditProcurementDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        item={activeEditItem}
      />

      {/* Themed Receive Stock Dialog */}
      <ReceiveStockDialog
        open={isReceiveOpen}
        onOpenChange={setIsReceiveOpen}
        item={activeReceiveItem}
      />

      {/* Themed Cancel Order Confirmation Dialog */}
      {cancelItem && (
        <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
          <DialogContent className="max-w-md border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Cancel Purchase Order</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Are you sure you want to cancel order <strong className="text-foreground font-mono">{cancelItem.purchaseOrderNumber || cancelItem.id}</strong> ({cancelItem.product})?
              </DialogDescription>
            </DialogHeader>
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
              This action will mark the purchase order as Cancelled and remove pending delivery tracking.
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCancelConfirmOpen(false)}
                className="text-xs"
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmCancel}
                className="text-xs"
              >
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Themed Delete PO Confirmation Dialog */}
      {deleteItem && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="max-w-md border bg-card">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                <span>Delete Purchase Order</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Are you sure you want to permanently delete purchase order{' '}
                <strong className="text-foreground font-mono">
                  {deleteItem.purchaseOrderNumber || deleteItem.id}
                </strong>{' '}
                for <strong className="text-foreground">{deleteItem.product}</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 p-3 bg-muted/40 rounded-lg border text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-medium text-foreground">{deleteItem.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU & Ordered:</span>
                <span className="font-medium font-mono text-foreground">
                  {deleteItem.sku} • {formatNumber(deleteItem.quantityOrdered)} units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total PO Value:</span>
                <span className="font-semibold font-mono text-foreground">
                  {formatCurrency(deleteItem.totalCost, 'INR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <span className="font-medium text-foreground">{deleteItem.status}</span>
              </div>
            </div>

            <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
              ⚠️ This action cannot be undone. This will permanently remove the purchase order, any linked incoming stock tracking, and associated alerts.
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setDeleteItem(null);
                }}
                className="text-xs"
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                className="text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
