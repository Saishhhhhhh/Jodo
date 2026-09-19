'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTasksStore } from '@/stores/tasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateTaskModal } from '@/components/tasks/create-task-modal';
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
  ArrowRight,
  RotateCcw,
  Kanban,
  Sparkles,
  Layers,
  ArrowUpRight,
  Activity,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function TasksDashboardPage() {
  const router = useRouter();
  const { tasks, fetchTasks } = useTasksStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [remarkFilter, setRemarkFilter] = useState<'all' | 'blocked' | 'in_progress'>('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTasks();
      toast.success('Task metrics refreshed');
    } catch {
      toast.error('Failed to refresh tasks');
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalTasks = tasks.length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const blocked = tasks.filter(t => t.status === 'Blocked').length;
  const completed = tasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length;
  const overdueTasks = tasks.filter(t => {
    return new Date(t.dueDate) < new Date() && t.status !== 'Completed' && t.status !== 'Closed';
  });
  const overdue = overdueTasks.length;

  const todayTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    const today = new Date();
    return dueDate.getDate() === today.getDate() &&
           dueDate.getMonth() === today.getMonth() &&
           dueDate.getFullYear() === today.getFullYear();
  });

  const allRemarks = tasks
    .filter(t => t.remark)
    .sort((a, b) => {
      const timeA = a.remarkUpdatedAt ? new Date(a.remarkUpdatedAt).getTime() : 0;
      const timeB = b.remarkUpdatedAt ? new Date(b.remarkUpdatedAt).getTime() : 0;
      return timeB - timeA;
    });

  const filteredRemarks = allRemarks.filter(t => {
    if (remarkFilter === 'blocked') return t.status === 'Blocked';
    if (remarkFilter === 'in_progress') return t.status === 'In Progress';
    return true;
  }).slice(0, 6);

  // Helper to resolve user display name from activity/task without raw ObjectIds
  const resolveUserName = (userVal: any, taskItem?: any): string => {
    if (!userVal) return 'Team Member';
    if (typeof userVal === 'object' && userVal.name) return userVal.name;
    if (typeof userVal === 'string') {
      // Check if it's a 24-character hexadecimal ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(userVal)) {
        if (taskItem?.assignedTo?.name && String(taskItem.assignedTo._id || taskItem.assignedTo.id) === userVal) {
          return taskItem.assignedTo.name;
        }
        if (taskItem?.createdBy?.name && String(taskItem.createdBy._id || taskItem.createdBy.id) === userVal) {
          return taskItem.createdBy.name;
        }
        if (taskItem?.remarkUpdatedBy?.name && String(taskItem.remarkUpdatedBy._id || taskItem.remarkUpdatedBy.id) === userVal) {
          return taskItem.remarkUpdatedBy.name;
        }
        return 'Team Member';
      }
      return userVal;
    }
    return 'Team Member';
  };

  const recentActivity = tasks.flatMap(t => 
    t.activities ? t.activities.map(a => ({ 
      ...a, 
      taskTitle: t.title, 
      taskId: (t as any)._id || t.id,
      resolvedUserName: resolveUserName(a.user, t),
      userAvatar: (a.user as any)?.avatarUrl
    })) : []
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 7);

  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  const summaryCards = [
    { 
      label: 'Total Tasks', 
      value: totalTasks, 
      sub: 'All active & logged',
      icon: CheckSquare, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      href: '/tasks/all-tasks'
    },
    { 
      label: 'Pending', 
      value: pending, 
      sub: 'Awaiting kickoff',
      icon: CircleDashed, 
      color: 'text-zinc-400', 
      bg: 'bg-zinc-500/10',
      href: '/tasks/all-tasks'
    },
    { 
      label: 'In Progress', 
      value: inProgress, 
      sub: 'Actively worked',
      icon: PlayCircle, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      href: '/tasks/all-tasks'
    },
    { 
      label: 'Blocked / Hold', 
      value: blocked, 
      sub: blocked > 0 ? 'Requires resolution' : 'Zero blockers',
      icon: AlertCircle, 
      color: blocked > 0 ? 'text-amber-500' : 'text-zinc-500', 
      bg: blocked > 0 ? 'bg-amber-500/10' : 'bg-zinc-500/10',
      border: blocked > 0 ? 'border-amber-500/30' : undefined,
      href: '/tasks/all-tasks'
    },
    { 
      label: 'Completed', 
      value: completed, 
      sub: 'Finished & verified',
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      href: '/tasks/completed'
    },
    { 
      label: 'Overdue', 
      value: overdue, 
      sub: overdue > 0 ? 'Action required' : 'All on schedule',
      icon: Clock, 
      color: overdue > 0 ? 'text-red-500' : 'text-zinc-500', 
      bg: overdue > 0 ? 'bg-red-500/10' : 'bg-zinc-500/10',
      border: overdue > 0 ? 'border-red-500/30' : undefined,
      href: '/tasks/overdue'
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Operations</span>
            <span>/</span>
            <span className="text-foreground font-medium">Task Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of team operations, progress tracking, and delay reasons.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className="text-xs gap-1.5 h-8 px-2.5 bg-card/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            Live
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-1.5 text-xs h-8"
            disabled={isRefreshing}
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/tasks/all-tasks">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Kanban className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Task Board</span>
            </Button>
          </Link>

          <CreateTaskModal>
            <Button size="sm" className="gap-1.5 text-xs h-8 font-medium shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Task</span>
            </Button>
          </CreateTaskModal>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {summaryCards.map((card, i) => (
          <Card 
            key={i} 
            onClick={() => router.push(card.href)}
            className={`overflow-hidden group metric-glow cursor-pointer transition-all hover:border-primary/40 border ${card.border || 'border-border'} bg-card`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight mt-1 text-foreground">
                    {card.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate mt-1.5">
                    {card.sub}
                  </p>
                </div>
                <div className={`shrink-0 rounded-lg p-2 ${card.bg} ${card.color} transition-transform group-hover:scale-110 duration-200`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Blockers Alert Banner (Shown when tasks are blocked) */}
      {blocked > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {blocked} {blocked === 1 ? 'task is' : 'tasks are'} currently blocked or on hold
              </p>
              <p className="text-xs text-muted-foreground">
                Review employee blockers and delay explanations below to unblock team deliverables.
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setRemarkFilter('blocked')}
            className="text-xs h-8 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shrink-0"
          >
            View Blockers
          </Button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Employee Remarks & Delay Updates */}
          <Card className="border border-border shadow-sm bg-card">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      Recent Employee Remarks & Delay Updates
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Real-time notes, blockers, and delay reasons posted by employees on their assigned tasks.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <div className="inline-flex items-center rounded-lg bg-muted/60 p-0.5 text-xs">
                    <button
                      onClick={() => setRemarkFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        remarkFilter === 'all' 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All ({allRemarks.length})
                    </button>
                    <button
                      onClick={() => setRemarkFilter('blocked')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        remarkFilter === 'blocked' 
                          ? 'bg-amber-500/20 text-amber-300 shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Blockers ({allRemarks.filter(t => t.status === 'Blocked').length})
                    </button>
                    <button
                      onClick={() => setRemarkFilter('in_progress')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                        remarkFilter === 'in_progress' 
                          ? 'bg-card text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      In Progress
                    </button>
                  </div>

                  <Link href="/tasks/all-tasks" className="text-xs text-muted-foreground hover:text-foreground ml-1 p-1">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {filteredRemarks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-muted-foreground" />
                  <p className="font-medium text-foreground">No employee remarks recorded yet</p>
                  <p className="text-[11px]">When team members update task status or report operational delays, they will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRemarks.map((t: any) => {
                    const taskId = t._id || t.id;
                    const isBlocked = t.status === 'Blocked';
                    const isCompleted = t.status === 'Completed' || t.status === 'Closed';
                    const assignedName = t.assignedTo?.name || (typeof t.assignedTo === 'string' && !/^[0-9a-fA-F]{24}$/.test(t.assignedTo) ? t.assignedTo : 'Unassigned');
                    const remarkByName = t.remarkUpdatedBy?.name || (typeof t.remarkUpdatedBy === 'string' && !/^[0-9a-fA-F]{24}$/.test(t.remarkUpdatedBy) ? t.remarkUpdatedBy : assignedName);

                    return (
                      <div
                        key={taskId}
                        onClick={() => router.push(`/tasks/${taskId}`)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                          isBlocked
                            ? 'bg-amber-500/[0.04] border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/[0.07]'
                            : isCompleted
                            ? 'bg-card border-border/80 hover:border-emerald-500/40 hover:bg-muted/20'
                            : 'bg-card border-border/80 hover:border-primary/50 hover:bg-muted/20'
                        }`}
                      >
                        {/* Task Header in Card */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                                {t.title}
                              </span>
                              
                              <Badge
                                variant={
                                  isCompleted
                                    ? 'success'
                                    : isBlocked
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-[10px] py-0 h-4 font-medium"
                              >
                                {t.status}
                              </Badge>

                              {t.priority && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] py-0 h-4 font-normal ${
                                    t.priority === 'Urgent' || t.priority === 'High' 
                                      ? 'text-red-400 border-red-500/30' 
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {t.priority}
                                </Badge>
                              )}

                              {t.department && (
                                <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                                  {t.department}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                            {t.remarkUpdatedAt && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(t.remarkUpdatedAt)}
                              </span>
                            )}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                          </div>
                        </div>

                        {/* Remark Quote Box */}
                        <div className={`mt-2.5 p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                          isBlocked 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' 
                            : 'bg-muted/40 border-border/50 text-foreground/90'
                        }`}>
                          {isBlocked ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5 flex-1">
                            {isBlocked && (
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                                Blocker / Hold Reason:
                              </p>
                            )}
                            <p className="italic leading-relaxed font-normal">
                              "{t.remark}"
                            </p>
                          </div>
                        </div>

                        {/* Assignee and Author Badges */}
                        <div className="flex items-center justify-between gap-2 pt-2.5 text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                                  {getInitials(assignedName)}
                                </AvatarFallback>
                              </Avatar>
                              <span>Assigned: <strong className="text-foreground font-medium">{assignedName}</strong></span>
                            </div>

                            {remarkByName && remarkByName !== assignedName && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px] bg-muted text-muted-foreground">
                                      {getInitials(remarkByName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>Remark by: <strong className="text-foreground font-medium">{remarkByName}</strong></span>
                                </div>
                              </>
                            )}
                          </div>

                          <span className="text-[11px] text-primary/80 font-medium group-hover:underline flex items-center gap-0.5">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Tasks Alert Table (If any exist) */}
          {overdue > 0 && (
            <Card className="border border-red-500/20 bg-red-500/[0.02]">
              <CardHeader className="pb-3 border-b border-red-500/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Overdue Tasks ({overdue})
                  </CardTitle>
                  <Link href="/tasks/overdue" className="text-xs text-red-400 hover:underline flex items-center gap-1 font-medium">
                    View in board <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-red-500/[0.04]">
                    <TableRow className="hover:bg-transparent border-red-500/10">
                      <TableHead className="text-xs text-muted-foreground">Task</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Assigned</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Delay Reason / Note</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueTasks.slice(0, 5).map((t: any) => {
                      const taskId = t._id || t.id;
                      const assignedName = t.assignedTo?.name || (typeof t.assignedTo === 'string' && !/^[0-9a-fA-F]{24}$/.test(t.assignedTo) ? t.assignedTo : 'Unassigned');

                      return (
                        <TableRow 
                          key={taskId} 
                          onClick={() => router.push(`/tasks/${taskId}`)} 
                          className="cursor-pointer hover:bg-red-500/[0.04] transition-colors border-border/40"
                        >
                          <TableCell className="font-medium text-sm py-3 text-foreground">
                            {t.title}
                          </TableCell>
                          <TableCell className="text-sm py-3">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                  {getInitials(assignedName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{assignedName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs py-3 max-w-[200px] truncate text-amber-300">
                            {t.remark ? `"${t.remark}"` : <span className="text-muted-foreground italic">No remark provided</span>}
                          </TableCell>
                          <TableCell className="text-xs py-3 text-red-400 font-medium whitespace-nowrap">
                            {format(new Date(t.dueDate), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks Table */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Today's Tasks ({todayTasks.length})
                </CardTitle>
                <Link href="/tasks/all-tasks" className="text-xs text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs space-y-1">
                  <Calendar className="w-6 h-6 mx-auto opacity-30" />
                  <p>No tasks scheduled specifically for today.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-border/60">
                      <TableHead className="text-xs text-muted-foreground">Task</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Assigned</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Latest Remark</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todayTasks.map((t: any) => {
                      const taskId = t._id || t.id;
                      const assignedName = t.assignedTo?.name || (typeof t.assignedTo === 'string' && !/^[0-9a-fA-F]{24}$/.test(t.assignedTo) ? t.assignedTo : 'Unassigned');

                      return (
                        <TableRow 
                          key={taskId} 
                          onClick={() => router.push(`/tasks/${taskId}`)} 
                          className="cursor-pointer hover:bg-muted/20 transition-colors border-border/40"
                        >
                          <TableCell className="font-medium text-sm py-3 text-foreground">
                            {t.title}
                          </TableCell>
                          <TableCell className="text-sm py-3">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                  {getInitials(assignedName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{assignedName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3 max-w-[200px] truncate">
                            {t.remark ? `"${t.remark}"` : '—'}
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge 
                              variant={t.status === 'Completed' ? 'success' : t.status === 'Blocked' ? 'destructive' : 'secondary'} 
                              className="text-[10px]"
                            >
                              {t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">

          {/* Operational Progress Card */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Operational Health
              </CardTitle>
              <CardDescription className="text-xs">
                Completion rate & task delivery progress
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-muted-foreground font-medium">Completion Rate</span>
                  <span className="font-bold text-foreground">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2 bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Active Tasks</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{inProgress + pending}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Overdue / Hold</p>
                  <p className="text-lg font-bold text-red-400 mt-0.5">{overdue + blocked}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Shortcuts</p>
                <div className="flex flex-col gap-1">
                  <Link 
                    href="/tasks/all-tasks" 
                    className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 p-2 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>View Kanban Board</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href="/tasks/team-tasks" 
                    className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 p-2 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>Department Tasks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href="/tasks/team-members" 
                    className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 p-2 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>Team Workload</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    href="/tasks/reports" 
                    className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 p-2 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span>Performance Reports</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Recent Activity
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-normal">
                  Live Log
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Audit trail of team remarks and status changes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {recentActivity.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">
                  No recent activities recorded.
                </div>
              ) : (
                <div className="relative pl-3 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-border">
                  {recentActivity.map((activity, idx) => {
                    const userName = activity.resolvedUserName || 'Team Member';

                    return (
                      <div key={activity.id || idx} className="relative flex items-start gap-3 group">
                        {/* Timeline dot */}
                        <div className="absolute -left-3 mt-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-card shrink-0" />
                        
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">
                              {userName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {activity.action}
                            </span>
                          </div>

                          <div>
                            <Link 
                              href={`/tasks/${activity.taskId}`} 
                              className="text-xs text-primary/90 hover:underline font-medium inline-flex items-center gap-1 group-hover:text-primary"
                            >
                              <span>{activity.taskTitle}</span>
                              <ArrowRight className="w-3 h-3 inline" />
                            </Link>
                          </div>

                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {activity.timestamp ? formatRelativeTime(activity.timestamp) : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
