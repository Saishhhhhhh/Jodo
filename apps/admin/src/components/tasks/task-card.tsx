'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Check, 
  CheckCircle2,
  Clock, 
  Play, 
  Pause, 
  Pencil, 
  Trash2, 
  Briefcase,
  Building,
  User as UserIcon,
  Tag
} from 'lucide-react';
import { Task, useTasksStore } from '@/stores/tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DurationModal } from './duration-modal';
import { useAuthStore } from '@/stores/auth';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isAdminOrManager?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isAdminOrManager = true }: TaskCardProps) {
  const currentUser = useAuthStore((state) => state.user);
  const isTeamMember = currentUser?.roles?.includes('TEAM_MEMBER');
  const canDelete = !isTeamMember && isAdminOrManager && !!onDelete;

  const toggleTimer = useTasksStore((state) => state.toggleTimer);
  const completeTask = useTasksStore((state) => state.completeTask);
  const reopenTask = useTasksStore((state) => state.reopenTask);
  const [durationModalOpen, setDurationModalOpen] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(task.loggedDuration || 0);

  // Live timer interval
  useEffect(() => {
    if (!task.timerRunning || !task.timerStartedAt) {
      setLiveSeconds(task.loggedDuration || 0);
      return;
    }

    const startedTime = new Date(task.timerStartedAt).getTime();
    const baseDuration = task.loggedDuration || 0;

    const interval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startedTime) / 1000));
      setLiveSeconds(baseDuration + elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [task.timerRunning, task.timerStartedAt, task.loggedDuration]);

  // Format Duration string e.g. "22h 07m 21s" or "00:00:04"
  const formatDurationDisplay = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const padM = String(minutes).padStart(2, '0');
    const padS = String(seconds).padStart(2, '0');

    if (hours > 0) {
      return `${hours}h ${padM}m ${padS}s`;
    }
    return `00:${padM}:${padS}`;
  };

  // Format Date and Days Left e.g. "16 Sept 2026 • 7d left"
  const getCountdownString = () => {
    if (!task.dueDate) return 'No due date';
    try {
      const dateObj = new Date(task.dueDate);
      const formattedDate = format(dateObj, 'dd MMM yyyy');
      const now = new Date();
      
      const diffTime = dateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let countdown = '';
      if (diffDays === 0) {
        countdown = 'Today';
      } else if (diffDays < 0) {
        countdown = `${Math.abs(diffDays)}d overdue`;
      } else {
        countdown = `${diffDays}d left`;
      }
      return `${formattedDate} • ${countdown}`;
    } catch {
      return 'Due date invalid';
    }
  };

  // Priority badge styling
  const renderPriorityBadge = () => {
    const p = (task.priority || 'Medium').toUpperCase();
    if (p === 'URGENT' || task.isUrgent) {
      return (
        <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          URGENT
        </Badge>
      );
    }
    if (p === 'HIGH') {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          HIGH
        </Badge>
      );
    }
    if (p === 'LOW') {
      return (
        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 text-muted-foreground">
          LOW
        </Badge>
      );
    }
    // Default MEDIUM
    return (
      <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
        MEDIUM
      </Badge>
    );
  };

  // Status badge styling
  const renderStatusBadge = () => {
    const s = (task.status || 'Pending').toUpperCase();
    if (s === 'COMPLETED' || s === 'CLOSED') {
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          COMPLETED
        </Badge>
      );
    }
    if (s === 'IN PROGRESS') {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          IN PROGRESS
        </Badge>
      );
    }
    if (s === 'BLOCKED') {
      return (
        <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          BLOCKED
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
        PENDING
      </Badge>
    );
  };

  // Department / Category badge
  const renderDepartmentBadge = () => {
    const rawCat = (task.category || task.department || task.team || 'Operations').toUpperCase();
    let display = rawCat;
    if (rawCat.includes('FOLLOW')) display = 'FOLLOW-UPS';
    else if (rawCat.includes('SALE')) display = 'SALES';
    else if (rawCat.includes('OPERAT')) display = 'OPERATIONS';
    else if (rawCat.includes('CONTENT')) display = 'CONTENT';
    else if (rawCat.includes('SUPPORT')) display = 'SUPPORT';

    return (
      <Badge variant="outline" className="text-[10px] font-mono tracking-wider px-2 py-0.5">
        {display}
      </Badge>
    );
  };

  // Assignee name & initial
  const assigneeName = task.assignedTo?.name || (typeof task.assignedTo === 'string' && !/^[0-9a-fA-F]{24}$/.test(task.assignedTo) ? task.assignedTo : 'Unassigned');
  const assigneeInitial = assigneeName.charAt(0).toUpperCase() || 'U';

  const completedByName = task.completedBy?.name || (task.status === 'Completed' ? assigneeName : null);

  const taskId = (task._id || task.id);

  return (
    <>
      <div className="bg-card text-card-foreground border border-border/70 hover:border-primary/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md">
        {/* Top Section */}
        <div className="space-y-3">
          {/* Header Row: Priority, Status, Completed by / Assigned */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {renderPriorityBadge()}
              {renderStatusBadge()}
            </div>

            <div className="text-[11px] text-muted-foreground truncate max-w-[170px]">
              {completedByName ? (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Completed by: <span className="font-semibold text-foreground">{completedByName}</span>
                </span>
              ) : (
                <span>Assigned: <strong className="text-foreground font-medium">{assigneeName}</strong></span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 
              className="text-[14px] font-semibold text-foreground leading-snug line-clamp-2 cursor-pointer group-hover:text-primary transition-colors"
              onClick={() => onEdit?.(task)}
              title={task.title}
            >
              {task.title}
            </h3>

            {/* Subtitle / Notes */}
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-normal">
              {task.description || task.clientBrief || 'No additional brief'}
            </p>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>{getCountdownString()}</span>
          </div>

          {/* Metadata Row: Assignee & Client */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                {assigneeInitial}
              </div>
              <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                {assigneeName}
              </span>
            </div>

            {task.clientName && (
              <div className="text-xs font-medium text-primary flex items-center gap-1 truncate max-w-[140px]">
                <Building className="w-3 h-3 shrink-0" />
                <span className="truncate">{task.clientName}</span>
              </div>
            )}
          </div>

          {/* Project & Department Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[190px]" title={task.projectName || 'General Project'}>
              {task.projectName || 'General Project'}
            </span>

            {renderDepartmentBadge()}
          </div>
        </div>

        {/* Bottom Section: Duration Badge, Start, Done, Edit & Delete */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t">
          {/* Duration Badge / Stopwatch display (Click to log or manually adjust duration) */}
          <button
            type="button"
            onClick={() => setDurationModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
              task.timerRunning
                ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-semibold'
                : liveSeconds > 0
                ? 'bg-muted/60 border-border text-foreground font-medium hover:bg-muted'
                : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Click to view or edit logged work duration"
          >
            {task.timerRunning ? (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            ) : liveSeconds > 0 ? (
              <Check className="w-3 h-3 text-green-500 stroke-[2.5]" />
            ) : (
              <Clock className="w-3 h-3 text-muted-foreground" />
            )}
            <span>{formatDurationDisplay(liveSeconds)}</span>
          </button>

          {/* Action buttons: Start, Done, Edit, and Delete (Admin only) */}
          <div className="flex items-center gap-1.5">
            {/* Start / Pause Button */}
            {task.status !== 'Completed' && (
              <Button
                type="button"
                size="sm"
                variant={task.timerRunning ? 'default' : 'outline'}
                onClick={() => toggleTimer(taskId)}
                className={`h-7 px-2.5 text-xs font-semibold gap-1 transition-all ${
                  task.timerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                    : 'text-foreground hover:text-primary hover:border-primary/40'
                }`}
                title={task.timerRunning ? 'Pause work timer' : 'Start working on this task'}
              >
                {task.timerRunning ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start</span>
                  </>
                )}
              </Button>
            )}

            {/* Done Button */}
            {task.status === 'Completed' ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => reopenTask(taskId)}
                className="h-7 px-2.5 text-xs font-medium gap-1 text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                title="Task completed! Click to re-open"
              >
                <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span>Done</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => completeTask(taskId)}
                className="h-7 px-2.5 text-xs font-medium gap-1 text-muted-foreground hover:text-green-600 hover:bg-green-500/10 hover:border-green-500/30 transition-colors"
                title="Mark task as Completed"
              >
                <Check className="w-3 h-3" />
                <span>Done</span>
              </Button>
            )}

            {/* Edit Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit?.(task)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Edit task & status"
            >
              <Pencil className="w-3 h-3" />
            </Button>

            {/* Delete Button (STRICTLY ADMIN / MANAGER ONLY) */}
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this task?')) {
                    onDelete(taskId);
                  }
                }}
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete task (Admin only)"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Duration Update Dialog */}
      <DurationModal
        task={task}
        isOpen={durationModalOpen}
        onClose={() => setDurationModalOpen(false)}
      />
    </>
  );
}
