'use client';

import React, { useState } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  Download,
  Package,
  RotateCcw,
  Percent,
  ArchiveX
} from 'lucide-react';
import { 
  Bar, 
  CartesianGrid, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Line,
  PieChart,
  Pie,
  ComposedChart,
  Scatter,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Mock Data
const kpiData = {
  sold: 4850,
  margin: 62.5,
  deadStock: 14500,
  returns: 1.8
};

// Volume vs Margin (Top Products)
const topPerformers = [
  { name: 'Ergo Chair', volume: 850, margin: 68 },
  { name: 'Pro Keyboard', volume: 620, margin: 45 },
  { name: 'Desk Mat', volume: 1200, margin: 75 },
  { name: 'Monitor Arm', volume: 430, margin: 55 },
  { name: 'Webcam', volume: 590, margin: 40 },
];

// Variant Performance
const variantData = [
  { name: 'Black / Medium', value: 45 },
  { name: 'Space Gray / Large', value: 30 },
  { name: 'White / Small', value: 15 },
  { name: 'Silver / One Size', value: 10 },
];
const COLORS = ['hsl(var(--primary))', '#8b5cf6', '#10b981', '#f59e0b'];

// Inventory Health (Stock vs Velocity)
const inventoryHealth = [
  { name: 'T-Shirt', stock: 120, velocity: 45 },
  { name: 'Hoodie', stock: 15, velocity: 30 },
  { name: 'Cap', stock: 45, velocity: 15 },
  { name: 'Socks', stock: 200, velocity: 150 },
  { name: 'Jacket', stock: 5, velocity: 2 },
];

const profitMatrix = [
  { id: 1, name: 'Premium Cotton T-Shirt', category: 'Apparel', cogs: 450, price: 1200, margin: 62.5, stock: 450 },
  { id: 2, name: 'Wireless Headphones', category: 'Electronics', cogs: 3500, price: 8900, margin: 60.6, stock: 45 },
  { id: 3, name: 'Ergonomic Office Chair', category: 'Furniture', cogs: 4200, price: 12500, margin: 66.4, stock: 12 },
  { id: 4, name: 'Smart Fitness Watch', category: 'Electronics', cogs: 1800, price: 5400, margin: 66.6, stock: 89 },
  { id: 5, name: 'Organic Coffee Beans', category: 'Food', cogs: 250, price: 800, margin: 68.7, stock: 210 },
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

// Custom Pie Chart Label
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AnalyticsProductsPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Analytics</h2>
          <p className="text-muted-foreground mt-1">Deep dive into item performance, margins, and inventory health.</p>
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
        {/* Products Sold */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Units Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpiData.sold)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +14%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>
        {/* Avg Profit Margin */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.margin}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +2.4%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>
        {/* Dead Stock Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dead Stock Value</CardTitle>
            <ArchiveX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{formatCurrency(kpiData.deadStock)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-rose-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +₹2.1k
              </span>
              needs liquidation
            </p>
          </CardContent>
        </Card>
        {/* Return Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Return Rate</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.returns}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center font-medium">
              <span className="text-emerald-500 flex items-center mr-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -0.3%
              </span>
              from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Volume vs Margin ComposedChart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Movers: Volume vs Margin</CardTitle>
            <CardDescription>Comparing total units sold against profit margins for top products.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topPerformers} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={15}
                  />
                  <YAxis 
                    yAxisId="left"
                    width={50}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dx={-5}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    width={50}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(val) => `${val}%`}
                    dx={5}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }} 
                    formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
                  />
                  <Bar yAxisId="left" dataKey="volume" name="Units Sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  <Line yAxisId="right" type="monotone" dataKey="margin" name="Profit Margin %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Variant Performance PieChart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Variant Dominance</CardTitle>
            <CardDescription>Sales distribution across top variant attributes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    itemStyle={tooltipItemStyle}
                    formatter={(value: number) => [`${value}%`, 'Share']}
                  />
                  <Pie
                    data={variantData}
                    cx="50%"
                    cy="40%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {variantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    layout="vertical"
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
                    wrapperStyle={{ fontSize: '13px', paddingBottom: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Health Chart */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Health Analysis</CardTitle>
            <CardDescription>Comparing current stock levels vs 30-day sales velocity to identify overstocked or at-risk items.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={inventoryHealth} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={15}
                  />
                  <YAxis 
                    width={50}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dx={-5}
                  />
                  <Tooltip 
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="stock" name="Current Stock" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} opacity={0.8} />
                  <Scatter dataKey="velocity" name="Sales Velocity (30d)" fill="#f43f5e" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Product Profitability Matrix</CardTitle>
            <CardDescription>Detailed financial performance metrics for individual products.</CardDescription>
          </div>
          <Button variant="outline" size="sm">Export Report</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">COGS</TableHead>
                <TableHead className="text-right">Retail Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right w-[120px]">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profitMatrix.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(item.cogs)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${item.margin > 65 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {item.margin}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatNumber(item.stock)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
