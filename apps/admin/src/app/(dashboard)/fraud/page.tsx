'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type RiskIndicator = {
  indicator: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskIndicators?: RiskIndicator[];
  fraudStatus: 'under_review' | 'approved' | 'cancelled';
  createdAt: string;
};

export default function FraudReviewPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'under_review' | 'approved' | 'cancelled'>('under_review');

  const { data: allOrders, isLoading } = useQuery({
    queryKey: ['orders-fraud'],
    queryFn: async () => {
      const res = await ordersApi.list();
      return res.data.data as Order[];
    },
  });

  const updateFraudMutation = useMutation({
    mutationFn: ({ id, fraudStatus }: { id: string; fraudStatus: string }) => 
      ordersApi.update(id, { fraudStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-fraud'] });
      toast.success('Fraud status updated successfully');
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error('Failed to update fraud status');
    },
  });

  // Calculate metrics
  const metrics = {
    pending: allOrders?.filter(o => o.fraudStatus === 'under_review').length || 0,
    highRisk: allOrders?.filter(o => o.riskLevel === 'high' && o.fraudStatus === 'under_review').length || 0,
    approved: allOrders?.filter(o => o.fraudStatus === 'approved').length || 0,
    cancelled: allOrders?.filter(o => o.fraudStatus === 'cancelled').length || 0,
  };

  // Filter orders for active tab
  const filteredOrders = allOrders?.filter(o => o.fraudStatus === activeTab) || [];

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.riskLevel === 'high' && <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />}
          {row.original.riskLevel === 'medium' && <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />}
          {row.original.riskLevel === 'low' && <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />}
          <span className="font-semibold">{row.getValue('orderNumber')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    { accessorKey: 'customerName', header: 'Customer' },
    {
      accessorKey: 'riskLevel',
      header: 'Risk Level',
      cell: ({ row }) => {
        const level = row.getValue('riskLevel') as string;
        return (
          <Badge
            variant={
              level === 'high' 
                ? 'destructive' 
                : level === 'medium' 
                ? 'secondary' // Tailwind variant maps or custom classes
                : 'default'
            }
            className={`capitalize ${
              level === 'medium' 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : level === 'low' 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : ''
            }`}
          >
            {level} Risk
          </Badge>
        );
      },
    },
    {
      accessorKey: 'riskScore',
      header: 'Risk Score',
      cell: ({ row }) => (
        <span className="font-semibold">{row.getValue('riskScore')}%</span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()} className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                  <Eye className="mr-2 h-4 w-4" /> View Analysis
                </DropdownMenuItem>
                {order.fraudStatus === 'under_review' && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => updateFraudMutation.mutate({ id: order._id, fraudStatus: 'approved' })}
                      disabled={updateFraudMutation.isPending}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Approve Order
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => updateFraudMutation.mutate({ id: order._id, fraudStatus: 'cancelled' })}
                      disabled={updateFraudMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fraud Reviews</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Inspect automatically flagged high-risk transactions before fulfilling items.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-lg p-2.5 bg-amber-500/10 text-amber-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Decisions Pending</p>
              <h3 className="text-2xl font-bold mt-0.5">{metrics.pending}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-lg p-2.5 bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">High Risk Flagged</p>
              <h3 className="text-2xl font-bold mt-0.5">{metrics.highRisk}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-lg p-2.5 bg-green-500/10 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Approved Reviews</p>
              <h3 className="text-2xl font-bold mt-0.5">{metrics.approved}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-lg p-2.5 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Cancelled Reviews</p>
              <h3 className="text-2xl font-bold mt-0.5">{metrics.cancelled}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <div className="space-y-4">
        <div className="flex border-b pb-px gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('under_review')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'under_review' 
                ? 'border-primary text-foreground font-semibold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Review ({metrics.pending})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'approved' 
                ? 'border-primary text-foreground font-semibold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Approved ({metrics.approved})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'cancelled' 
                ? 'border-primary text-foreground font-semibold' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Cancelled ({metrics.cancelled})
          </button>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredOrders} 
          isLoading={isLoading} 
          onRowClick={(row) => setSelectedOrder(row)}
        />
      </div>

      {/* Analysis Details Dialog */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  <DialogTitle>Fraud Analysis — {selectedOrder.orderNumber}</DialogTitle>
                </div>
                <DialogDescription>
                  Detailed risk analysis generated by the auto-fraud detection engine.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-5">
                {/* Risk overview */}
                <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg border">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Overall Risk Assessment</span>
                    <h4 className="text-lg font-bold capitalize mt-0.5">{selectedOrder.riskLevel} Risk ({selectedOrder.riskScore}%)</h4>
                  </div>
                  <Badge variant={selectedOrder.riskLevel === 'high' ? 'destructive' : 'secondary'} className="h-7 px-3 text-xs capitalize">
                    {selectedOrder.fraudStatus.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Risk indicators feed */}
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold tracking-tight border-b pb-1">Risk Indicators</h5>
                  
                  {(!selectedOrder.riskIndicators || selectedOrder.riskIndicators.length === 0) ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4">No risk indicators flagged for this order.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedOrder.riskIndicators.map((ind, idx) => (
                        <div key={idx} className="flex gap-3 text-sm p-3 rounded-lg border bg-card">
                          <div className="shrink-0 mt-0.5">
                            {ind.severity === 'high' && <XCircle className="h-4 w-4 text-destructive" />}
                            {ind.severity === 'medium' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                            {ind.severity === 'low' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5 capitalize">
                              {ind.indicator} 
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">({ind.severity})</span>
                            </div>
                            <p className="text-muted-foreground text-xs mt-1 leading-normal">{ind.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Close</Button>
                {selectedOrder.fraudStatus === 'under_review' && (
                  <>
                    <Button 
                      variant="destructive"
                      disabled={updateFraudMutation.isPending}
                      onClick={() => updateFraudMutation.mutate({ id: selectedOrder._id, fraudStatus: 'cancelled' })}
                    >
                      Cancel Order
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={updateFraudMutation.isPending}
                      onClick={() => updateFraudMutation.mutate({ id: selectedOrder._id, fraudStatus: 'approved' })}
                    >
                      Approve Order
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
