'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileText, Download, FileSpreadsheet, Calendar as CalendarIcon, Clock, Package, Users, ShoppingCart, Activity, Tag } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    from: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['reports', 'summary', dateRange],
    queryFn: async () => {
      const res = await reportsApi.summary(dateRange);
      return res.data;
    },
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['reports', 'history'],
    queryFn: async () => {
      const res = await reportsApi.history();
      return res.data;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: (type: string) => reportsApi.generate({ ...dateRange, type }),
    onSuccess: () => {
      toast.success('Report generated successfully');
      queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
    },
    onError: () => {
      toast.error('Failed to generate report');
    }
  });

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!summary) {
      toast.error('No data available to export');
      return;
    }

    try {
      // Flatten the summary object for CSV
      const rows = [
        ['Category', 'Metric', 'Value'],
        ['Sales', 'Total Revenue', summary.sales?.totalRevenue || 0],
        ['Sales', 'Total Orders', summary.sales?.totalOrders || 0],
        ['Leads', 'Total Acquired', summary.leads?.total || 0],
        ['Inventory', 'Distinct Items', summary.inventory?.totalItems || 0],
        ['Inventory', 'Total Quantity', summary.inventory?.totalQuantity || 0],
        ['Quotations', 'Total Drafts', summary.quotations?.total || 0],
        ['Orders', 'Total Paid', summary.orders?.byStatus?.paid || 0],
        ['Orders', 'Total Pending', summary.orders?.byStatus?.pending || 0],
        ['Support', 'Open Cases', summary.supportCases?.open || 0],
        ['Support', 'Resolved Cases', summary.supportCases?.resolved || 0],
        ['Follow-ups', 'Pending', summary.followUps?.pending || 0],
        ['Follow-ups', 'Overdue', summary.followUps?.overdue || 0],
      ];

      const csvContent = rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `jodo_reports_summary_${dateRange.from}_to_${dateRange.to}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate CSV');
    }
  };

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View store summaries and generate detailed reports.
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <div className="flex items-center gap-2 bg-background border rounded-md p-1">
            <Input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="h-8 border-none shadow-none text-sm w-auto"
            />
            <span className="text-muted-foreground">-</span>
            <Input 
              type="date" 
              value={dateRange.to} 
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="h-8 border-none shadow-none text-sm w-auto"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            title="Export PDF"
          >
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            title="Export Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button 
            onClick={() => generateReportMutation.mutate('custom')}
            disabled={generateReportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" /> 
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Sales Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Summary</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(summary?.sales?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">{summary?.sales?.totalOrders || 0} Total Orders</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Orders Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Paid</span><span className="font-medium">{summary?.orders?.byStatus?.paid || 0}</span></div>
                <div className="flex justify-between"><span>Pending</span><span className="font-medium">{summary?.orders?.byStatus?.pending || 0}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Summary</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.leads?.total || 0}</div>
                <p className="text-xs text-muted-foreground">New leads acquired</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Inventory Summary */}
        <Link href="/inventory/intelligence" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Summary</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {isLoadingSummary ? (
                <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{summary?.inventory?.totalQuantity || 0}</div>
                  <p className="text-xs text-muted-foreground">Across {summary?.inventory?.totalItems || 0} distinct items</p>
                  <p className="text-xs text-primary mt-2 font-medium">View Intelligence →</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        {/* Quotations Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotations</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold">{summary?.quotations?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        {/* Support Cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoadingSummary ? (
              <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Open</span><span className="font-medium">{summary?.supportCases?.open || 0}</span></div>
                <div className="flex justify-between"><span>Resolved</span><span className="font-medium">{summary?.supportCases?.resolved || 0}</span></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Follow ups */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {isLoadingSummary ? (
              <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{summary?.followUps?.pending || 0}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">{summary?.followUps?.overdue || 0}</div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />)}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date Generated</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No reports generated yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history?.map((report: any) => (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium">
                          {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell>{report.name}</TableCell>
                        <TableCell className="capitalize">{report.type}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {report.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/reports/${report._id}`}>
                              View
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this report?')) {
                                reportsApi.delete(report._id).then(() => {
                                  toast.success('Report deleted');
                                  queryClient.invalidateQueries({ queryKey: ['reports', 'history'] });
                                }).catch(() => toast.error('Failed to delete report'));
                              }
                            }}
                          >
                            <span className="sr-only">Delete</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
