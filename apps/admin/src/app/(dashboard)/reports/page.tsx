'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Package, 
  FileText,
  AlertCircle,
  PieChart as PieChartIcon,
  MousePointerClick
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e'];

export default function ReportsPage() {
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  const { data: digest, isLoading } = useQuery({
    queryKey: ['reports', 'digest'],
    queryFn: async () => {
      const res = await reportsApi.getDigest();
      return res.data.data;
    }
  });

  const generateMutation = useMutation({
    mutationFn: () => reportsApi.generateAiSummary(digest),
    onSuccess: (res) => {
      setAiSummary(res.data.data);
      if (res.data.data?.metricsBreakdown?.length > 0) {
        setSelectedMetric(res.data.data.metricsBreakdown[0]);
      }
      toast.success('AI Summary generated successfully!');
    },
    onError: () => {
      toast.error('Failed to generate AI summary.');
    }
  });

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
          <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border/50">
            <div>
              <h3 className="font-semibold text-lg">AI Performance Analysis</h3>
              <p className="text-sm text-muted-foreground">Generate a detailed executive summary based on live metrics.</p>
            </div>
            <Button 
              onClick={() => generateMutation.mutate()} 
              disabled={generateMutation.isPending}
              className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-md"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate AI Summary'}
            </Button>
          </div>

          {aiSummary && (
            <Card className="border-primary/30 shadow-md bg-gradient-to-br from-primary/5 via-background to-background">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2">
                  {aiSummary.summaryTitle || 'Executive Performance Report'}
                </CardTitle>
                <CardDescription className="text-base text-foreground/80 mt-2 font-medium">
                  {aiSummary.executiveSummary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                
                {/* Full Breakdown View */}
                {aiSummary.metricsBreakdown && (
                  <div className="space-y-4">
                    {aiSummary.metricsBreakdown.map((section: any, idx: number) => (
                      <div 
                        key={idx} 
                        id={`metric-${section.metric.replace(/\s+/g, '-')}`}
                        className={`border rounded-lg p-4 transition-all duration-300 ${
                          selectedMetric?.metric === section.metric 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border/50 bg-muted/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
                          <h3 className="text-sm font-bold text-primary uppercase tracking-widest">
                            {section.metric}
                          </h3>
                          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Score: {section.attentionScore || 0}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Daily Summary</p>
                            <p className="text-sm text-foreground/90 leading-relaxed mb-2">{section.dailySummary}</p>
                            {section.dailyDetails && section.dailyDetails.length > 0 && (
                              <ul className="list-disc pl-4 space-y-1">
                                {section.dailyDetails.map((detail: any, i: number) => (
                                  <li key={i} className="text-xs text-foreground/70">
                                    {typeof detail === 'object' ? JSON.stringify(detail) : detail}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Weekly Summary</p>
                            <p className="text-sm text-foreground/90 leading-relaxed mb-2">{section.weeklySummary}</p>
                            {section.weeklyDetails && section.weeklyDetails.length > 0 && (
                              <ul className="list-disc pl-4 space-y-1">
                                {section.weeklyDetails.map((detail: any, i: number) => (
                                  <li key={i} className="text-xs text-foreground/70">
                                    {typeof detail === 'object' ? JSON.stringify(detail) : detail}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {aiSummary.actionItems && aiSummary.actionItems.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-orange-500">
                      <AlertCircle className="w-4 h-4" />
                      Suggested Action Items
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      {aiSummary.actionItems.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-foreground/80">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle>Performance Digest</CardTitle>
              <CardDescription>Raw metrics calculated from midnight today and start of this week.</CardDescription>
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

        {/* Right Col: Pie Chart Analysis */}
        <div className="space-y-6">
          <Card className="border-none shadow-md h-full bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" />
                Attention Score
              </CardTitle>
              <CardDescription>
                AI-driven analysis of which business areas require the most attention right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-8">
              {aiSummary?.metricsBreakdown ? (
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aiSummary.metricsBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="attentionScore"
                        nameKey="metric"
                        onClick={(data) => {
                          setSelectedMetric(data.payload);
                          document.getElementById(`metric-${data.payload.metric.replace(/\s+/g, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className="cursor-pointer outline-none"
                      >
                        {aiSummary.metricsBreakdown.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            className="hover:opacity-80 transition-opacity stroke-background stroke-2"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        formatter={(value: number, name: string) => [`Score: ${value}`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-center text-xs text-muted-foreground mt-4 italic">
                    * Click any segment to view detailed insights.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/50 border-2 border-dashed border-muted rounded-full w-full max-w-[300px] aspect-square">
                  <PieChartIcon className="w-16 h-16 mb-4 opacity-20" />
                  <span className="text-sm font-medium">No Analysis Data</span>
                  <span className="text-xs">Generate a summary to view chart</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

