'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ReportDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: report, isLoading } = useQuery({
    queryKey: ['reports', id],
    queryFn: async () => {
      const res = await reportsApi.get(id as string);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-1/4 bg-muted animate-pulse rounded" />
        <div className="h-64 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Report not found.
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{report.name}</h1>
            <p className="text-sm text-muted-foreground">
              Generated on {format(new Date(report.createdAt), 'PPpp')}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold capitalize">{report.type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold capitalize">{report.status}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Date Range (From)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {report.dateRange?.from ? format(new Date(report.dateRange.from), 'PP') : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Date Range (To)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {report.dateRange?.to ? format(new Date(report.dateRange.to), 'PP') : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Data Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            {report.data ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Sales */}
                  <TableRow>
                    <TableCell className="font-medium" rowSpan={2}>Sales</TableCell>
                    <TableCell>Total Revenue</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(report.data.sales?.totalRevenue || 0)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Orders</TableCell>
                    <TableCell className="text-right">{report.data.sales?.totalOrders || 0}</TableCell>
                  </TableRow>
                  
                  {/* Leads */}
                  <TableRow>
                    <TableCell className="font-medium">Leads</TableCell>
                    <TableCell>Total Acquired</TableCell>
                    <TableCell className="text-right">{report.data.leads?.total || 0}</TableCell>
                  </TableRow>

                  {/* Inventory */}
                  <TableRow>
                    <TableCell className="font-medium" rowSpan={2}>Inventory</TableCell>
                    <TableCell>Distinct Items</TableCell>
                    <TableCell className="text-right">{report.data.inventory?.totalItems || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Quantity</TableCell>
                    <TableCell className="text-right">{report.data.inventory?.totalQuantity || 0}</TableCell>
                  </TableRow>

                  {/* Quotations */}
                  <TableRow>
                    <TableCell className="font-medium">Quotations</TableCell>
                    <TableCell>Total Drafts</TableCell>
                    <TableCell className="text-right">{report.data.quotations?.total || 0}</TableCell>
                  </TableRow>

                  {/* Orders */}
                  <TableRow>
                    <TableCell className="font-medium" rowSpan={3}>Orders Status</TableCell>
                    <TableCell>Total Paid</TableCell>
                    <TableCell className="text-right">{report.data.orders?.byStatus?.paid || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Pending</TableCell>
                    <TableCell className="text-right">{report.data.orders?.byStatus?.pending || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Refunded / Failed</TableCell>
                    <TableCell className="text-right">
                      {(report.data.orders?.byStatus?.refunded || 0) + (report.data.orders?.byStatus?.failed || 0)}
                    </TableCell>
                  </TableRow>

                  {/* Support Cases */}
                  <TableRow>
                    <TableCell className="font-medium" rowSpan={2}>Support Cases</TableCell>
                    <TableCell>Open</TableCell>
                    <TableCell className="text-right">{report.data.supportCases?.open || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Resolved</TableCell>
                    <TableCell className="text-right">{report.data.supportCases?.resolved || 0}</TableCell>
                  </TableRow>

                  {/* Follow Ups */}
                  <TableRow>
                    <TableCell className="font-medium" rowSpan={2}>Follow-ups</TableCell>
                    <TableCell>Pending</TableCell>
                    <TableCell className="text-right">{report.data.followUps?.pending || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Overdue</TableCell>
                    <TableCell className="text-right text-destructive font-medium">{report.data.followUps?.overdue || 0}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                No data available for this report.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tables */}
      {report.data?.details && (
        <div className="space-y-6 mt-8 print:mt-12 break-before-page">
          <h2 className="text-xl font-bold tracking-tight">Detailed Breakdown</h2>
          
          {report.data.details.orders?.length > 0 && ['sales', 'orders', 'daily', 'weekly', 'custom'].includes(report.type) && (
            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-lg">Sales & Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.data.details.orders.map((o: any) => (
                      <TableRow key={o._id}>
                        <TableCell className="font-medium">{o.orderNumber}</TableCell>
                        <TableCell>{o.customerName}</TableCell>
                        <TableCell>{format(new Date(o.createdAt), 'PP')}</TableCell>
                        <TableCell className="capitalize">{o.paymentStatus}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(o.totalAmount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {report.data.details.quotations?.length > 0 && ['quotations', 'daily', 'weekly', 'custom'].includes(report.type) && (
            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-lg">Draft Orders / Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.data.details.quotations.map((q: any) => (
                      <TableRow key={q._id}>
                        <TableCell className="font-medium">{q.orderNumber}</TableCell>
                        <TableCell>{q.customerName}</TableCell>
                        <TableCell className="text-right">{format(new Date(q.createdAt), 'PP')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {report.data.details.leads?.length > 0 && ['leads', 'daily', 'weekly', 'custom'].includes(report.type) && (
            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-lg">New Leads Acquired</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Acquired On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.data.details.leads.map((l: any) => (
                      <TableRow key={l._id}>
                        <TableCell className="font-medium">{l.firstName} {l.lastName}</TableCell>
                        <TableCell>{l.email}</TableCell>
                        <TableCell className="text-right">{format(new Date(l.createdAt), 'PP')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {report.data.details.inventory?.length > 0 && ['inventory', 'daily', 'weekly', 'custom'].includes(report.type) && (
            <Card className="break-inside-avoid">
              <CardHeader>
                <CardTitle className="text-lg">Inventory Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                      <TableHead className="text-right">Reserved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.data.details.inventory.map((i: any) => (
                      <TableRow key={i._id}>
                        <TableCell className="font-medium">{i.sku}</TableCell>
                        <TableCell className="text-right">{i.available}</TableCell>
                        <TableCell className="text-right">{i.reserved || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
