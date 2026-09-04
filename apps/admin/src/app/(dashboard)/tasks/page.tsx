'use client';

import React from 'react';
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
  PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function TasksDashboardPage() {
  const router = useRouter();
  const tasks = useTasksStore(state => state.tasks);

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

  const recentActivity = tasks.flatMap(t => 
    t.activities.map(a => ({ ...a, taskTitle: t.title, taskId: t.id }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const summaryCards = [
    { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending', value: pending, icon: CircleDashed, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
    { label: 'In Progress', value: inProgress, icon: PlayCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Blocked', value: blocked, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Overdue', value: overdue, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of team operations and tasks.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                        <TableHead className="text-xs text-zinc-400">Priority</TableHead>
                        <TableHead className="text-xs text-zinc-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayTasks.map((t) => (
                        <TableRow key={t.id} onClick={() => router.push(`/tasks/${t.id}`)} className="cursor-pointer hover:bg-muted/10">
                          <TableCell className="font-medium text-sm py-3">{t.title}</TableCell>
                          <TableCell className="text-sm py-3">{t.assignedTo}</TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
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
                        <TableHead className="text-xs text-red-400">Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed').map((t) => (
                        <TableRow key={t.id} onClick={() => router.push(`/tasks/${t.id}`)} className="cursor-pointer hover:bg-red-500/5">
                          <TableCell className="font-medium text-sm py-3">{t.title}</TableCell>
                          <TableCell className="text-sm py-3">{t.assignedTo}</TableCell>
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

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                    <div>
                      <p className="text-foreground">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <Link href={`/tasks/${activity.taskId}`} className="text-xs text-primary hover:underline">
                        {activity.taskTitle}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
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
