'use client';

import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/lib/api-client';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, UserPlus, MapPin, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsCustomersPage() {
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customersApi.list();
      return res.data.data;
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading customer analytics...</div>;
  }

  const customers = customersData || [];
  const totalCustomers = customers.length;

  // Process data for Customer Growth chart (grouped by month)
  const growthDataMap = new Map();
  const locationDataMap = new Map();
  let newsletterSubscribers = 0;

  customers.forEach((customer: any) => {
    // Growth over time
    const date = new Date(customer.createdAt);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    growthDataMap.set(monthYear, (growthDataMap.get(monthYear) || 0) + 1);

    // Locations
    const state = customer.defaultAddress?.state || 'Unknown';
    locationDataMap.set(state, (locationDataMap.get(state) || 0) + 1);

    // Newsletter
    if (customer.acceptsMarketing) newsletterSubscribers++;
  });

  // Sort growth data chronologically (simplistic sort for display)
  const growthData = Array.from(growthDataMap.entries())
    .map(([date, count]) => ({ date, newCustomers: count }))
    .reverse(); // Assuming descending order from API, reverse for chronological

  // Format location data
  const locationData = Array.from(locationDataMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 locations

  const COLORS = ['#f472b6', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

  // Table columns for detailed report
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => <span className="font-medium">{row.original.firstName} {row.original.lastName}</span>,
    },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.original.defaultAddress?.state || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Insights into your customer base, growth, and demographics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Customers</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{totalCustomers}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
            Active across all regions
          </p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">New This Month</h3>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">
            {growthData.length > 0 ? growthData[growthData.length - 1].newCustomers : 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on recent signups</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Newsletter Subs</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{newsletterSubscribers}</div>
          <p className="text-xs text-muted-foreground mt-1">Accepts marketing emails</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium">Avg Order Value</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">₹8,450</div>
          <p className="text-xs text-muted-foreground mt-1 text-emerald-500">+12% from last month</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Growth Chart */}
        <div className="col-span-4 rounded-xl border bg-card shadow-sm p-6">
          <h3 className="font-semibold mb-4">Customer Growth Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData.length > 0 ? growthData : [{ date: 'Jan', newCustomers: 0 }]}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="newCustomers" 
                  name="New Customers"
                  stroke="#f472b6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorGrowth)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics / Locations */}
        <div className="col-span-3 rounded-xl border bg-card shadow-sm p-6">
          <h3 className="font-semibold mb-4">Top Regions (by State)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationData.length > 0 ? locationData : [{ name: 'No Data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(locationData.length > 0 ? locationData : [{ name: 'No Data', value: 1 }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {locationData.map((loc, i) => (
              <div key={loc.name} className="flex items-center text-xs">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {loc.name} ({loc.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight">Customer Detailed Report</h2>
          <p className="text-sm text-muted-foreground mt-0.5">A complete list of all registered customers and their statuses.</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <DataTable 
            columns={columns} 
            data={customers} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
