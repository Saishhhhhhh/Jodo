'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function DailyReportPage() {
  const [dateRange, setDateRange] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports', 'summary', 'daily', dateRange],
    queryFn: async () => {
      const res = await reportsApi.summary(dateRange);
      return res.data;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: () => reportsApi.generate({ ...dateRange, type: 'daily' }),
    onSuccess: (res) => {
      toast.success('Daily report generated successfully');
      window.location.href = `/reports/${res.data._id}`;
    },
    onError: () => {
      toast.error('Failed to generate report');
    }
  });

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate and download a comprehensive daily snapshot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-background border rounded-md p-1">
            <span className="text-sm text-muted-foreground ml-2">Date:</span>
            <Input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => setDateRange({ from: e.target.value, to: e.target.value })}
              className="h-8 border-none shadow-none text-sm w-auto"
            />
          </div>
          <Button 
            onClick={() => generateReportMutation.mutate()}
            disabled={generateReportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" /> 
            Generate & Download
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Daily Overview (Preview)</CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-1/4 bg-muted animate-pulse rounded" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <div className="text-2xl font-bold mt-1">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(summary?.sales?.totalRevenue || 0)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <div className="text-2xl font-bold mt-1">{summary?.sales?.totalOrders || 0}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads</p>
                <div className="text-2xl font-bold mt-1">{summary?.leads?.total || 0}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quotations</p>
                <div className="text-2xl font-bold mt-1">{summary?.quotations?.total || 0}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
