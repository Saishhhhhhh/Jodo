'use client';

import React, { useState, useMemo } from 'react';
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
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useWarehouseStore, ProductionOrderItem } from '@/stores/warehouse';
import { formatNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductionOrdersTabProps {
  onOpenCreate: () => void;
  onOpenQC?: () => void;
}

export function ProductionOrdersTab({ onOpenCreate, onOpenQC }: ProductionOrdersTabProps) {
  const { productionOrders, updateProductionStage } = useWarehouseStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrderItem | null>(null);

  const filteredData = useMemo(() => {
    return productionOrders.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.assignedManager.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchPriority = priorityFilter === 'ALL' || order.priority === priorityFilter;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [productionOrders, searchTerm, statusFilter, priorityFilter]);

  const handleUpdateOutput = (order: ProductionOrderItem) => {
    const input = window.prompt(
      `Update completed quantity for ${order.id} (${order.product}):\nCurrently completed: ${order.completedQuantity} / ${order.quantity}\nEnter new completed quantity:`,
      (order.completedQuantity ?? 0).toString()
    );
    if (!input) return;
    const qty = parseInt(input, 10);
    if (isNaN(qty) || qty < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    const targetStage = qty >= order.quantity ? 'Production Completed' : 'In Production';
    updateProductionStage(order.id, targetStage, qty);
    toast.success(`Production progress updated to ${qty} units for ${order.id}`);
  };

  const handleSendToQC = (order: ProductionOrderItem) => {
    updateProductionStage(order.id, 'Quality Check', order.completedQuantity);
    toast.success(`Order ${order.id} sent to Quality Inspection bay`);
    if (onOpenQC) onOpenQC();
  };

  const handleMarkCompleted = (order: ProductionOrderItem) => {
    updateProductionStage(order.id, 'Production Completed', order.quantity);
    toast.success(`Order ${order.id} marked as Production Completed`);
  };

  const handleReportDelay = (order: ProductionOrderItem) => {
    const input = window.prompt(
      `Report delay for ${order.id}:\nEnter reason for delay:`,
      'Raw material shortage / machine downtime'
    );
    if (!input) return;
    toast.warning(`Delay reported for ${order.id}. Critical alert generated.`);
  };

  const getPriorityBadge = (priority: ProductionOrderItem['priority']) => {
    switch (priority) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'High':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">High</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Medium</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: ProductionOrderItem['status']) => {
    switch (status) {
      case 'In Production':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-none">In Production</Badge>;
      case 'QC Pending':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/15 border-none">QC Pending</Badge>;
      case 'Completed':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/15 border-none">Completed</Badge>;
      case 'Material Pending':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/15 border-none">Material Pending</Badge>;
      case 'Scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'Delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="text-muted-foreground line-through">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 w-full sm:w-80 bg-card rounded-md border px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search order ID, product, SKU, manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="In Production">In Production</SelectItem>
              <SelectItem value="QC Pending">QC Pending</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Material Pending">Material Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Schedule Production
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product & SKU</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead>Planned Dates</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="w-32">Progress</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-semibold text-xs text-foreground">
                    {order.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs text-foreground">{order.product}</div>
                    <div className="text-[11px] font-mono text-muted-foreground">{order.sku}</div>
                  </TableCell>
                  <TableCell className="text-xs text-foreground">{order.manufacturer}</TableCell>
                  <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-xs">
                    {formatNumber(order.quantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-green-600 dark:text-green-400 font-bold">
                    {formatNumber(order.completedQuantity)}
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                    <div>{order.plannedStartDate}</div>
                    <div className="text-[10px]">Due: {order.plannedCompletionDate}</div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">{order.destinationWarehouse}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-muted-foreground">{order.progress}%</span>
                        <span className="text-[10px] text-muted-foreground">
                          {order.quantity - order.completedQuantity} left
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, order.progress))}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateOutput(order)}>
                          <TrendingUp className="mr-2 h-4 w-4" /> Update Completed Qty
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendToQC(order)}>
                          <ClipboardCheck className="mr-2 h-4 w-4 text-blue-500" /> Send to QC
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMarkCompleted(order)}>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReportDelay(order)} className="text-amber-600">
                          <AlertTriangle className="mr-2 h-4 w-4" /> Report Delay
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="h-28 text-center text-xs text-muted-foreground">
                  No production orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground px-1">
        Showing {filteredData.length} of {productionOrders.length} production orders
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Production Order: {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                {selectedOrder.product} ({selectedOrder.sku})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Manufacturer:</span>
                  <span className="font-semibold text-foreground">{selectedOrder.manufacturer}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Priority:</span>
                  <span>{selectedOrder.priority}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Batch Quantity:</span>
                  <span className="font-bold text-sm">{formatNumber(selectedOrder.quantity)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Completed:</span>
                  <span className="font-bold text-sm text-green-600">{formatNumber(selectedOrder.completedQuantity)}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/20 rounded-lg border space-y-1.5 text-muted-foreground">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Raw Material Requirement:
                  </span>
                  <p className="text-foreground font-medium">{selectedOrder.rawMaterialRequirement}</p>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span>Planned Schedule:</span>
                  <span className="text-foreground">{selectedOrder.plannedStartDate} → {selectedOrder.plannedCompletionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Production Manager:</span>
                  <span className="text-foreground font-medium">{selectedOrder.assignedManager}</span>
                </div>
                <div className="flex justify-between">
                  <span>Destination Hub:</span>
                  <span className="text-foreground">{selectedOrder.destinationWarehouse}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-muted/30 rounded-lg border text-muted-foreground italic">
                  &ldquo;{selectedOrder.notes}&rdquo;
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
