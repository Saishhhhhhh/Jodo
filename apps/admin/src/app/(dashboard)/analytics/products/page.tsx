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
  ArchiveX,
  Sparkles,
  Info
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
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api-client';
import { ProductAnalyticsDialog, ProductAnalyticsData } from './product-analytics-dialog';
import { Skeleton } from '@/components/ui/skeleton';

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

const COLORS = ['hsl(var(--primary))', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

// Custom Pie Chart Label
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AnalyticsProductsPage() {
  const [dateRange, setDateRange] = React.useState('30d');
  const [selectedProduct, setSelectedProduct] = useState<ProductAnalyticsData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch real database analytics
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['products-analytics', dateRange],
    queryFn: async () => {
      const res = await productsApi.analytics({ dateRange });
      return res.data?.data;
    },
  });

  const kpiData = analyticsRes?.kpiData || {
    sold: 0,
    margin: 0,
    deadStock: 0,
    returns: 0,
  };
  const topPerformers = analyticsRes?.topPerformers || [];
  const variantData = analyticsRes?.variantData || [];
  const inventoryHealth = analyticsRes?.inventoryHealth || [];
  const profitMatrix = analyticsRes?.profitMatrix || [];
  const productsMap = analyticsRes?.productsMap || {};

  const handleOpenProductDetails = (productName: string) => {
    if (!productName) return;
    const lower = productName.toLowerCase().trim();

    // Look up directly in real DB products map
    let details = productsMap[productName] || productsMap[lower];

    // If not found by key, search in all real products by name, sku, or _id
    if (!details && analyticsRes?.allProducts) {
      details = analyticsRes.allProducts.find((p: any) => 
        p.name.toLowerCase() === lower ||
        p.name.toLowerCase().includes(lower) ||
        lower.includes(p.name.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === lower) ||
        (p._id && p._id === productName)
      );
    }

    if (details) {
      setSelectedProduct(details);
      setIsDialogOpen(true);
    }
  };

  const extractProductName = (data: any): string | null => {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (data.fullName && typeof data.fullName === 'string') return data.fullName;
    if (data.name && typeof data.name === 'string') return data.name;
    if (data.payload?.fullName) return data.payload.fullName;
    if (data.payload?.name) return data.payload.name;
    if (data.activePayload?.[0]?.payload?.fullName) return data.activePayload[0].payload.fullName;
    if (data.activePayload?.[0]?.payload?.name) return data.activePayload[0].payload.name;
    if (data.activeLabel && typeof data.activeLabel === 'string') return data.activeLabel;
    return null;
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Top Movers: Volume vs Margin</span>
                  <Badge variant="outline" className="text-[11px] font-normal text-primary border-primary/30 bg-primary/5">
                    Click Bar for Info
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Comparing total units sold against profit margins for top products. Click any bar to inspect product popup.
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border/40 shrink-0 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Click bar to inspect
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={topPerformers} 
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                  className="cursor-pointer"
                  onClick={(state) => {
                    const name = extractProductName(state);
                    if (name) handleOpenProductDetails(name);
                  }}
                >
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
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={tooltipStyle} className="p-3 shadow-xl min-w-[180px]">
                            <p style={tooltipLabelStyle} className="font-semibold text-sm">{label}</p>
                            <div className="space-y-1 my-1.5">
                              {payload.map((entry: any, index: number) => (
                                <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4 text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {entry.name.includes('Margin') || entry.name.includes('%') ? `${entry.value}%` : formatNumber(entry.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 mt-2 border-t border-border/40 text-[11px] text-primary flex items-center gap-1 font-medium">
                              <span>👆 Click bar to inspect product popup</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }} 
                    formatter={(value) => <span className="text-foreground font-medium">{value}</span>}
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="volume" 
                    name="Units Sold" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                    cursor="pointer"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onClick={(data) => {
                      const name = extractProductName(data);
                      if (name) handleOpenProductDetails(name);
                    }}
                  >
                    {topPerformers.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} cursor="pointer" className="cursor-pointer hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="margin" 
                    name="Profit Margin %" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 5, strokeWidth: 2, cursor: 'pointer' }} 
                    activeDot={{ r: 7, cursor: 'pointer' }}
                    cursor="pointer"
                    onClick={(data) => {
                      const name = extractProductName(data);
                      if (name) handleOpenProductDetails(name);
                    }}
                  />
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
            <div className="flex flex-col h-[350px] w-full items-center justify-center">
              <div className="h-[200px] w-full">
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
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={95}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {variantData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-6">
                <ul className="flex flex-col space-y-2.5 text-sm w-[80%] mx-auto">
                  {variantData.map((entry: any, index: number) => (
                    <li key={`item-${index}`} className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-3 shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                      />
                      <span className="text-muted-foreground font-medium">{entry.name}</span>
                      <span className="ml-auto font-semibold text-foreground">{entry.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Health Chart */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Inventory Health Analysis</span>
                  <Badge variant="outline" className="text-[11px] font-normal text-purple-400 border-purple-500/30 bg-purple-500/5">
                    Click Bar for Info
                  </Badge>
                </CardTitle>
                <CardDescription>Comparing current stock levels vs 30-day sales velocity to identify overstocked or at-risk items. Click any bar for details.</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border/40 shrink-0 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Click bar to inspect
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={inventoryHealth} 
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                  className="cursor-pointer"
                  onClick={(state) => {
                    const name = extractProductName(state);
                    if (name) handleOpenProductDetails(name);
                  }}
                >
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
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={tooltipStyle} className="p-3 shadow-xl min-w-[180px]">
                            <p style={tooltipLabelStyle} className="font-semibold text-sm">{label}</p>
                            <div className="space-y-1 my-1.5">
                              {payload.map((entry: any, index: number) => (
                                <div key={`health-tooltip-${index}`} className="flex items-center justify-between gap-4 text-xs">
                                  <span className="text-muted-foreground flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    {entry.name}:
                                  </span>
                                  <span className="font-bold text-foreground">
                                    {formatNumber(entry.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 mt-2 border-t border-border/40 text-[11px] text-primary flex items-center gap-1 font-medium">
                              <span>👆 Click bar to inspect product popup</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar 
                    dataKey="stock" 
                    name="Current Stock" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40} 
                    opacity={0.8} 
                    cursor="pointer"
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                    onClick={(data) => {
                      const name = extractProductName(data);
                      if (name) handleOpenProductDetails(name);
                    }}
                  >
                    {inventoryHealth.map((_entry: any, index: number) => (
                      <Cell key={`health-cell-${index}`} cursor="pointer" className="cursor-pointer hover:opacity-100 transition-opacity" />
                    ))}
                  </Bar>
                  <Scatter 
                    dataKey="velocity" 
                    name="Sales Velocity (30d)" 
                    fill="#f43f5e" 
                    cursor="pointer"
                    onClick={(data) => {
                      const name = extractProductName(data);
                      if (name) handleOpenProductDetails(name);
                    }}
                  />
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
            <CardTitle className="flex items-center gap-2">
              <span>Product Profitability Matrix</span>
              <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                Click row for full popup
              </Badge>
            </CardTitle>
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
              {profitMatrix.map((item: any) => (
                <TableRow 
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  onClick={() => handleOpenProductDetails(item.name)}
                >
                  <TableCell className="font-medium group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <Sparkles className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </TableCell>
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

      {/* Product Analytics Detail Modal Popup */}
      <ProductAnalyticsDialog
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
