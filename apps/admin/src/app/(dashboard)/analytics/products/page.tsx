'use client';

import React, { useState } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  Download,
  IndianRupee,
  Package,
  RotateCcw,
  AlertTriangle
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock Data
const productSalesData = [
  { date: 'Jun 1', sales: 12000, units: 120 },
  { date: 'Jun 5', sales: 18000, units: 145 },
  { date: 'Jun 10', sales: 15000, units: 130 },
  { date: 'Jun 15', sales: 22000, units: 180 },
  { date: 'Jun 20', sales: 31000, units: 250 },
  { date: 'Jun 25', sales: 28000, units: 220 },
  { date: 'Jun 30', sales: 42000, units: 310 },
];

const categoryData = [
  { name: 'Apparel', value: 35000 },
  { name: 'Electronics', value: 25000 },
  { name: 'Home & Living', value: 15000 },
  { name: 'Accessories', value: 10000 },
];

const inventoryData = [
  { id: 1, name: 'Ergonomic Office Chair', sku: 'CH-442', stock: 5, status: 'Low Stock' },
  { id: 2, name: 'Wireless Headphones', sku: 'HP-092', stock: 0, status: 'Out of Stock' },
  { id: 3, name: 'Smart Fitness Watch', sku: 'WT-110', stock: 12, status: 'In Stock' },
  { id: 4, name: 'Mechanical Keyboard', sku: 'KB-101', stock: 2, status: 'Low Stock' },
  { id: 5, name: 'Desk Organizer', sku: 'DO-005', stock: 45, status: 'In Stock' },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
const formatNumber = (value: number) => value.toLocaleString();

// Common tooltip styles
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

export default function AnalyticsProductsPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Analytics</h2>
          <p className="text-muted-foreground mt-1">Monitor product performance, categories, and inventory levels.</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹168,000</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              from last period
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productSalesData}>
                  <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Units Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,355</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              from last period
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productSalesData}>
                  <Line type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Return Rate</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-rose-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +0.4%
              </span>
              from last period
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productSalesData}>
                  <Line type="monotone" dataKey="sales" stroke="#f43f5e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-rose-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +3
              </span>
              from last week
            </p>
            <div className="h-[48px] mt-4 -ml-2 -mr-2 flex items-end px-2 space-x-1">
              {[4, 6, 8, 12, 10, 15, 12].map((val, i) => (
                <div key={i} className="bg-rose-500/80 rounded-t-sm w-full" style={{ height: `${(val / 15) * 100}%` }}></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>Daily product sales performance for the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[380px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productSalesData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorProductSales" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => `₹${value/1000}k`}
                    dx={-5}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorProductSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue breakdown by product category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[380px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
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
                    {categoryData.map((entry, index) => (
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
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Monitor stock levels for your key products.</CardDescription>
          </div>
          <Button variant="outline" size="sm">Manage Inventory</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[400px]">Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead className="text-right w-[150px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.sku}</TableCell>
                  <TableCell className="text-right">{formatNumber(item.stock)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.stock === 0 ? 'destructive' : item.stock < 10 ? 'secondary' : 'default'} className="ml-auto">
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
