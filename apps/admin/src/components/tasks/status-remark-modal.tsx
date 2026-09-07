'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTasksStore, Task, TaskStatus } from '@/stores/tasks';
import { MessageSquare, AlertTriangle, Clock, CheckCircle2, History, User } from 'lucide-react';
import { format } from 'date-fns';

interface StatusRemarkModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus?: TaskStatus;
}

const QUICK_REASONS = [
  { label: 'Client Feedback', text: 'Delayed: Waiting for client response/feedback', icon: Clock },
  { label: 'Technical Blocker', text: 'Delayed: Blocked by technical roadblock/dependency', icon: AlertTriangle },
  { label: 'Access / Credentials', text: 'Delayed: Awaiting required system access or credentials', icon: Clock },
  { label: 'In Development', text: 'In Progress: Actively working on implementation', icon: Clock },
  { label: 'Under QA Review', text: 'In Progress: Testing and quality check in progress', icon: Clock },
  { label: 'Completed Deliverable', text: 'Completed: All deliverables verified and completed', icon: CheckCircle2 },
];

export function StatusRemarkModal({ task, open, onOpenChange, initialStatus }: StatusRemarkModalProps) {
  const updateTask = useTasksStore(state => state.updateTask);
  const [status, setStatus] = useState<TaskStatus>(initialStatus || task?.status || 'Pending');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (task) {
      setStatus(initialStatus || task.status);
      setRemark('');
      setShowHistory(false);
    }
  }, [task, initialStatus, open]);

  if (!task) return null;

  const taskId = (task._id || task.id) as string;
  const isBlockedOrDelayed = status === 'Blocked';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updates: any = {};
      if (status !== task.status) {
        updates.status = status;
      }
      if (remark.trim()) {
        updates.remark = remark.trim();
      }

      // If neither changed, just close
      if (Object.keys(updates).length === 0) {
        onOpenChange(false);
        return;
      }

      await updateTask(taskId, updates);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to update status and remark', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyChip = (text: string) => {
    setRemark(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-card border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Update Task Status & Remark</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground line-clamp-1">
                {task.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Status Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="task-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </Label>
            <Select value={status} onValueChange={(val: TaskStatus) => setStatus(val)}>
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Blocked">Blocked / Delayed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            {isBlockedOrDelayed && (
              <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Please provide a reason below explaining why this task is delayed.
              </p>
            )}
          </div>

          {/* Remark Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-remark" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Remark / Delay Reason
              </Label>
              <span className="text-[11px] text-muted-foreground">Admin will see this note</span>
            </div>
            <Textarea
              id="task-remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={
                isBlockedOrDelayed
                  ? "e.g., Delayed because we are awaiting client approval on the UI specs..."
                  : "Add notes on progress, deliverables, or updates..."
              }
              className="min-h-[90px] text-sm resize-y"
            />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground font-medium">Quick reason presets:</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyChip(chip.text)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-left"
                >
                  <chip.icon className="w-3 h-3 text-primary shrink-0" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Remark / History Preview */}
          {task.remark && !showHistory && (
            <div className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Latest Existing Remark
                </span>
                {task.remarks && task.remarks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(true)}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <History className="w-3 h-3" /> View all ({task.remarks.length})
                  </button>
                )}
              </div>
              <p className="text-xs text-foreground italic">"{task.remark}"</p>
              {task.remarkUpdatedAt && (
                <p className="text-[10px] text-muted-foreground">
                  Updated {format(new Date(task.remarkUpdatedAt), 'MMM d, h:mm a')}
                  {task.remarkUpdatedBy?.name && ` by ${task.remarkUpdatedBy.name}`}
                </p>
              )}
            </div>
          )}

          {/* Remark History view */}
          {showHistory && task.remarks && task.remarks.length > 0 && (
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2 max-h-40 overflow-y-auto">
              <div className="flex items-center justify-between sticky top-0 bg-transparent">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Remark History
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Hide
                </button>
              </div>
              <div className="space-y-2 divide-y divide-border/60">
                {task.remarks.map((r, i) => (
                  <div key={i} className="pt-2 first:pt-0 space-y-0.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {r.userName || r.user?.name || 'Team Member'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {r.createdAt ? format(new Date(r.createdAt), 'MMM d, h:mm a') : ''}
                      </span>
                    </div>
                    {r.statusAtTime && (
                      <Badge variant="outline" className="text-[9px] py-0 h-4 px-1.5">
                        Status: {r.statusAtTime}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">"{r.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Status & Remark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
