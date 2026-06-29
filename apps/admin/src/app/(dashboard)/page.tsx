'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  RotateCcw,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { dashboardApi } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { DashboardSummary } from '@jodo/shared';

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await dashboardApi.summary();
      return res.data.data as DashboardSummary;
    },
    refetchInterval: 60_000, // Refresh every minute
  });

  const metrics = data
    ? [
        { metric: data.totalRevenue, icon: DollarSign },
        { metric: data.ordersToday, icon: ShoppingCart },
        { metric: data.averageOrderValue, icon: TrendingUp },
        { metric: data.netRevenue, icon: DollarSign },
        { metric: data.conversionRate, icon: Users },
        { metric: data.pendingFulfillments, icon: Truck },
        { metric: data.lowStockProducts, icon: Package },
        { metric: data.returnedOrders, icon: RotateCcw },
      ]
    : [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            Live
          </Badge>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <MetricCard key={i} isLoading />
            ))
          : metrics.map(({ metric, icon }, i) => (
              <MetricCard key={i} metric={metric} icon={icon} />
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <CardDescription>Last 30 days revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={data?.salesByDay || []}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239 84% 67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(240 4% 16%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(240 5% 55%)' }}
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(240 5% 55%)' }}
                    tickFormatter={(v) => `₹${v}`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(240 10% 7%)',
                      border: '1px solid hsl(240 4% 16%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelFormatter={(val) => formatDate(val)}
                    formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(239 84% 67%)"
                    strokeWidth={2}
                    fill="url(#revenue-gradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Store Status</CardTitle>
            <CardDescription>Current store health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))
            ) : (
              <>
                <StatusRow label="Payment Gateway" status="active" />
                <StatusRow label="Storefront API" status="active" />
                <StatusRow label="Email Service" status="warning" />
                <StatusRow label="Search Index" status="active" />
                <StatusRow label="Webhooks" status="active" />

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                    <span>Email service needs configuration</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Setup Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <CardDescription>Latest orders across all channels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (data?.recentOrders?.length ?? 0) === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="Orders will appear here once customers start purchasing."
              />
            ) : (
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-card">
                <Table>
                  <TableHeader className="bg-muted/30 border-b border-zinc-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs text-zinc-400 font-semibold py-3">Order</TableHead>
                      <TableHead className="text-xs text-zinc-400 font-semibold py-3">Customer</TableHead>
                      <TableHead className="text-xs text-zinc-400 font-semibold py-3">Payment</TableHead>
                      <TableHead className="text-xs text-zinc-400 font-semibold py-3">Fulfillment</TableHead>
                      <TableHead className="text-xs text-zinc-400 font-semibold py-3 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data!.recentOrders.map((order) => (
                      <TableRow 
                        key={order._id} 
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className="hover:bg-muted/10 border-b border-zinc-800/60 last:border-0 cursor-pointer transition-colors"
                      >
                        <TableCell className="font-semibold text-sm py-3.5">
                          #{order.orderNumber}
                        </TableCell>
                        <TableCell className="text-sm py-3.5">
                          {order.customerName}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge
                            variant={order.paymentStatus === 'paid' ? 'default' : order.paymentStatus === 'refunded' ? 'destructive' : 'secondary'}
                            className="text-[10px] capitalize font-medium py-0 px-2"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge
                            variant={order.fulfillmentStatus === 'fulfilled' ? 'default' : 'secondary'}
                            className="text-[10px] capitalize font-medium py-0 px-2"
                          >
                            {order.fulfillmentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-sm text-emerald-400 py-3.5">
                          {formatCurrency(order.totalAmount, order.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Checklist */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Store Setup</CardTitle>
            <CardDescription>Complete these steps to launch your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {(() => {
                const steps = data?.setupSteps || SETUP_ITEMS;
                const completedCount = steps.filter(item => item.done).length;
                const percentage = Math.round((completedCount / steps.length) * 100);

                return (
                  <>
                    {steps.map((item) => {
                      const rowContent = (
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors w-full cursor-pointer">
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                              item.done
                                ? 'bg-green-500/15 text-green-500'
                                : 'border border-border text-muted-foreground'
                            }`}
                          >
                            {item.done && (
                              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                                <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-sm ${item.done ? 'text-zinc-500 line-through' : 'text-foreground font-medium'}`}
                          >
                            {item.label}
                          </span>
                        </div>
                      );

                      if (item.path && item.path !== '#') {
                        return (
                          <Link key={item.label} href={item.path} className="block">
                            {rowContent}
                          </Link>
                        );
                      }

                      return <div key={item.label}>{rowContent}</div>;
                    })}
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{completedCount} of {steps.length} completed</span>
                        <span className="font-semibold text-indigo-400">{percentage}% done</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: 'active' | 'warning' | 'error' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <Badge
        variant={status === 'active' ? 'success' : status === 'warning' ? 'warning' : 'destructive'}
        className="text-[10px]"
      >
        {status}
      </Badge>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{description}</p>
    </div>
  );
}

const SETUP_ITEMS: { label: string; done: boolean; path: string }[] = [
  { label: 'Connect MongoDB database', done: true, path: '#' },
  { label: 'Configure store details', done: false, path: '/settings' },
  { label: 'Add a product', done: false, path: '/products' },
  { label: 'Set up payment method', done: false, path: '/settings/payments' },
  { label: 'Configure shipping zones', done: false, path: '/settings/shipping' },
  { label: 'Set up email notifications', done: false, path: '/settings' },
  { label: 'Connect a domain', done: false, path: '/settings' },
];
