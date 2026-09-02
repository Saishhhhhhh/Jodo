'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Download, Bell } from 'lucide-react';
import { format } from 'date-fns';

export default function FollowupsReportPage() {
  const [dateRange, setDateRange] = useState({
    from: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports', 'summary', 'follow-ups', dateRange],
    queryFn: async () => {
      const res = await reportsApi.summary(dateRange);
      return res.data;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: () => reportsApi.generate({ ...dateRange, type: 'follow-ups' }),
    onSuccess: (res) => {
      toast.success('Follow-ups report generated successfully');
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
          <h1 className="text-2xl font-bold tracking-tight">Follow-ups Report</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate and download pending and overdue follow-up metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-background border rounded-md p-1 opacity-50 cursor-not-allowed">
            <Input 
              type="date" 
              disabled
              value={dateRange.from} 
              className="h-8 border-none shadow-none text-sm w-auto"
            />
            <span className="text-muted-foreground">-</span>
            <Input 
              type="date" 
              disabled
              value={dateRange.to} 
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
          <CardTitle className="text-lg font-medium">Follow-ups Overview (Preview)</CardTitle>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-1/4 bg-muted animate-pulse rounded" />
          ) : (
            <div className="flex gap-12 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <div className="text-3xl font-bold mt-1 text-yellow-600">{summary?.followUps?.pending || 0}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <div className="text-3xl font-bold mt-1 text-destructive">{summary?.followUps?.overdue || 0}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
