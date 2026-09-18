'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  BarChart2, 
  Send, 
  TrendingUp, 
  Users, 
  Package, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function ReportsPage() {
  const [phone, setPhone] = useState('');

  const { data: digest, isLoading } = useQuery({
    queryKey: ['reports', 'digest'],
    queryFn: async () => {
      const res = await reportsApi.getDigest();
      return res.data.data;
    }
  });

  const sendMutation = useMutation({
    mutationFn: (targetPhone: string) => reportsApi.sendDigest(targetPhone),
    onSuccess: () => {
      toast.success('Daily Digest sent successfully via WhatsApp!');
      setPhone('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to send digest. Check Interakt settings.');
    }
  });

  const handleSend = () => {
    if (!phone) return toast.error('Please enter a WhatsApp number');
    sendMutation.mutate(phone);
  };

  if (isLoading || !digest) {
    return <div className="p-6 text-muted-foreground animate-pulse">Generating reports...</div>;
  }

  const kpis = [
    { 
      label: 'Revenue', 
      daily: `₹${digest.daily.revenue.toLocaleString()}`, 
      weekly: `₹${digest.weekly.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-500' 
    },
    { 
      label: 'Orders', 
      daily: digest.daily.orders, 
      weekly: digest.weekly.orders,
      icon: Package,
      color: 'text-blue-500' 
    },
    { 
      label: 'New Leads', 
      daily: digest.daily.newLeads, 
      weekly: digest.weekly.newLeads,
      icon: Users,
      color: 'text-purple-500' 
    },
    { 
      label: 'Quotations Sent', 
      daily: digest.daily.quotationsSent, 
      weekly: digest.weekly.quotationsSent,
      icon: FileText,
      color: 'text-orange-500' 
    },
    { 
      label: 'Support Cases Opened', 
      daily: digest.daily.supportCasesOpened, 
      weekly: digest.weekly.supportCasesOpened,
      icon: AlertCircle,
      color: 'text-red-500' 
    }
  ];

  return (
    <div className="p-6 animate-fade-in max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-primary" />
            Auto-Reporting & Digest
          </h1>
          <p className="text-muted-foreground mt-1">
            Automated daily and weekly summaries of your business performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: The Data */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle>Performance Digest</CardTitle>
              <CardDescription>Metrics calculated from midnight today and start of this week.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {kpis.map((kpi, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md bg-muted/50 ${kpi.color}`}>
                        <kpi.icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-sm">{kpi.label}</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Today</p>
                        <p className="font-semibold text-lg">{kpi.daily}</p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">This Week</p>
                        <p className="font-semibold text-lg">{kpi.weekly}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Action & Alerts */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-4 h-4" />
                Dispatch Digest
              </CardTitle>
              <CardDescription>
                Manually trigger the daily WhatsApp summary report to your phone. (This will be automated via Cron at 8 AM).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input 
                  placeholder="+1234567890" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSend}
                disabled={sendMutation.isPending}
              >
                {sendMutation.isPending ? 'Sending...' : 'Send Daily Summary'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Action Required Alerts</CardTitle>
              <CardDescription>Critical items pending your attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">High Priority Follow-ups</span>
                <span className="bg-destructive/10 text-destructive font-bold px-2 py-0.5 rounded">
                  {digest.current.pendingFollowUps}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Low Stock Products</span>
                <span className="bg-destructive/10 text-destructive font-bold px-2 py-0.5 rounded">
                  {digest.current.lowStockItems}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Open Support Cases</span>
                <span className="bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded">
                  {digest.current.openSupportCases}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
