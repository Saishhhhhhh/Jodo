'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTasksStore } from '@/stores/tasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  CircleDashed,
  PlayCircle,
  MessageSquare,
  AlertTriangle,
  User,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function TasksDashboardPage() {
  const router = useRouter();
  const { tasks, fetchTasks } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const totalTasks = tasks.length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const blocked = tasks.filter(t => t.status === 'Blocked').length;
  const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length;
  const overdue = tasks.filter(t => {
    const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed';
    return isOverdue;
  }).length;

  const todayTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate.getDate() === today.getDate() &&
           dueDate.getMonth() === today.getMonth() &&
           dueDate.getFullYear() === today.getFullYear();
  });

  const recentRemarks = tasks
    .filter(t => t.remark)
    .sort((a, b) => {
      const timeA = a.remarkUpdatedAt ? new Date(a.remarkUpdatedAt).getTime() : 0;
      const timeB = b.remarkUpdatedAt ? new Date(b.remarkUpdatedAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 6);

  const recentActivity = tasks.flatMap(t => 
    t.activities ? t.activities.map(a => ({ ...a, taskTitle: t.title, taskId: (t as any)._id || t.id })) : []
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const summaryCards = [
    { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending', value: pending, icon: CircleDashed, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
    { label: 'In Progress', value: inProgress, icon: PlayCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Blocked / Hold', value: blocked, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Overdue', value: overdue, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of team operations, progress, and delay reasons.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tasks/all-tasks" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
            View all tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div className={`p-2 rounded-full ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Employee Remarks & Delay Updates (Admin Visibility) */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Recent Employee Remarks & Delay Updates
                </CardTitle>
                <Link href="/tasks/all-tasks" className="text-xs text-muted-foreground hover:text-foreground">
                  See table
                </Link>
              </div>
              <CardDescription className="text-xs">
                Real-time notes, blockers, and delay reasons posted by employees on their assigned tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentRemarks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No employee remarks recorded yet. When employees update task status or report delays, they will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRemarks.map((t: any) => {
                    const taskId = t._id || t.id;
                    const isBlocked = t.status === 'Blocked';

                    return (
                      <div
                        key={taskId}
                        onClick={() => router.push(`/tasks/${taskId}`)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-primary/50 space-y-1.5 ${
                          isBlocked
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-card border-border hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm hover:underline text-foreground">
                              {t.title}
                            </span>
                            <Badge
                              variant={
                                t.status === 'Completed' || t.status === 'Closed'
                                  ? 'success'
                                  : t.status === 'Blocked'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-[10px] py-0 h-4"
                            >
                              {t.status}
                            </Badge>
                          </div>
                          {t.remarkUpdatedAt && (
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(t.remarkUpdatedAt), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-1.5 pt-0.5">
                          {isBlocked ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          )}
                          <p className={`text-xs italic ${isBlocked ? 'text-amber-200 font-medium' : 'text-foreground/90'}`}>
                            "{t.remark}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Assigned to: <strong className="text-foreground font-medium">{t.assignedTo?.name || t.assignedTo || 'Unassigned'}</strong></span>
                          </span>
                          {t.remarkUpdatedBy?.name && (
                            <>
                              <span>•</span>
                              <span>Remark by: <strong className="text-foreground font-medium">{t.remarkUpdatedBy.name}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No tasks due today.
                </div>
              ) : (
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-card">
                  <Table>
                    <TableHeader className="bg-muted/30 border-b border-zinc-800">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs text-zinc-400">Task</TableHead>
                        <TableHead className="text-xs text-zinc-400">Assigned</TableHead>
                        <TableHead className="text-xs text-zinc-400">Remark</TableHead>
                        <TableHead className="text-xs text-zinc-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayTasks.map((t: any) => (
                        <TableRow key={t._id || t.id} onClick={() => router.push(`/tasks/${t._id || t.id}`)} className="cursor-pointer hover:bg-muted/10">
                          <TableCell className="font-medium text-sm py-3">{t.title}</TableCell>
                          <TableCell className="text-sm py-3">{t.assignedTo?.name || t.assignedTo || 'Unassigned'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3 max-w-[200px] truncate">
                            {t.remark ? `"${t.remark}"` : '—'}
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge variant={t.status === 'Completed' ? 'success' : 'secondary'} className="text-[10px]">
                              {t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          {overdue > 0 && (
            <Card className="border-red-500/20 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Overdue Tasks ({overdue})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-red-500/20 rounded-xl overflow-hidden bg-background">
                  <Table>
                    <TableHeader className="bg-red-500/10 border-b border-red-500/20">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs text-red-400">Task</TableHead>
                        <TableHead className="text-xs text-red-400">Assigned</TableHead>
                        <TableHead className="text-xs text-red-400">Employee Remark / Reason</TableHead>
                        <TableHead className="text-xs text-red-400">Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed').map((t: any) => (
                        <TableRow key={t._id || t.id} onClick={() => router.push(`/tasks/${t._id || t.id}`)} className="cursor-pointer hover:bg-red-500/5">
                          <TableCell className="font-medium text-sm py-3">{t.title}</TableCell>
                          <TableCell className="text-sm py-3">{t.assignedTo?.name || t.assignedTo || 'Unassigned'}</TableCell>
                          <TableCell className="text-xs py-3 max-w-[220px] truncate text-amber-300">
                            {t.remark ? `"${t.remark}"` : <span className="text-muted-foreground">No remark yet</span>}
                          </TableCell>
                          <TableCell className="text-sm py-3 text-red-400">
                            {format(new Date(t.dueDate), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar: Activity Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={activity.id || idx} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-foreground">
                        <span className="font-medium">{(activity as any).user?.name || (activity as any).user || 'System'}</span> {activity.action}
                      </p>
                      <Link href={`/tasks/${activity.taskId}`} className="text-xs text-primary hover:underline">
                        {activity.taskTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.timestamp ? format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a') : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
