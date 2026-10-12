'use client';

import React, { useState } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  Download,
  MoreHorizontal,
  TrendingUp,
  CreditCard,
  IndianRupee,
  Package,
  Users
} from 'lucide-react';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Line,
  LineChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';



const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
const formatNumber = (value: number) => value.toLocaleString();

// Common tooltip styles for shadcn-like feel in both light/dark modes
const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 'calc(var(--radius) - 2px)',
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
};

const tooltipLabelStyle = {
  color: 'hsl(var(--muted-foreground))',
  fontWeight: 500,
  marginBottom: '4px'
};

const tooltipItemStyle = {
  color: 'hsl(var(--foreground))',
  fontWeight: 600,
};

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsSalesPage() {
  const [dateRange, setDateRange] = React.useState('30d');

  const { data: salesRes, isLoading } = useQuery({
    queryKey: ['analytics', 'sales', dateRange],
    queryFn: async () => {
      const res = await analyticsApi.sales({ dateRange });
      return res.data?.data;
    },
  });

  const kpiData = salesRes?.kpiData || {
    sales: 0,
    orders: 0,
    aov: 0,
    conversion: 0,
  };

  const salesData = salesRes?.salesData || [];
  const channelData = salesRes?.channelData || [];
  const topProducts = salesRes?.topProducts || [];

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
          <p className="text-muted-foreground mt-1">Review your store's sales performance and channel distribution.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.sales)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +20.1%
              </span>
              from last period
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{formatNumber(kpiData.orders)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15.2%
              </span>
              from last period
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{kpiData.aov.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-rose-500 flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -2.4%
              </span>
              from last period
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <Line type="monotone" dataKey="sales" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.conversion}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +1.2%
              </span>
              from last period
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>Daily sales performance for the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[380px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={15}
                  />
                  <YAxis 
                    width={70}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                    dx={-5}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    formatter={(value: number) => [`₹${value}`, 'Sales']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales by Channel</CardTitle>
            <CardDescription>Distribution of sales across different channels.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[380px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value/1000}k`}
                    dy={15}
                  />
                  <YAxis 
                    width={100}
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 500 }}
                    dx={-5}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {channelData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['hsl(var(--primary))', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Your best performing products in this period.</CardDescription>
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[400px]">Product</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead className="text-right">Gross Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{product.variant}</div>
                  </TableCell>
                  <TableCell>{formatNumber(product.orders)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(product.sales)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
