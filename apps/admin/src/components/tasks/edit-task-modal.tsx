'use client';

import React, { useState, useEffect } from 'react';
import { useTasksStore, Task, TaskStatus, TaskPriority } from '@/stores/tasks';
import { useAuthStore } from '@/stores/auth';
import { staffApi } from '@/lib/api-client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Pencil, MessageSquare, AlertTriangle, User } from 'lucide-react';

interface EditTaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
}

export function EditTaskModal({ task, open, onOpenChange, onTaskUpdated }: EditTaskModalProps) {
  const updateTask = useTasksStore(state => state.updateTask);
  const fetchTasks = useTasksStore(state => state.fetchTasks);
  const currentUser = useAuthStore(state => state.user);
  const isTeamMember = currentUser?.roles?.includes('TEAM_MEMBER');

  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sales');
  const [taskType, setTaskType] = useState('General');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task && open) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || 'Sales');
      setTaskType((task as any).taskType || 'General');
      setPriority((task.priority as TaskPriority) || 'Medium');
      setStatus(task.status || 'Pending');

      const assignedId = typeof task.assignedTo === 'object' && task.assignedTo
        ? (task.assignedTo as any)._id || (task.assignedTo as any).id
        : task.assignedTo || '';
      setAssignedTo(assignedId);

      if (task.dueDate) {
        try {
          setDueDate(format(new Date(task.dueDate), 'yyyy-MM-dd'));
        } catch {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }

      setRemark(task.remark || '');
    }
  }, [task, open]);

  useEffect(() => {
    if (open) {
      setStaffLoading(true);
      staffApi.list({ limit: 100 })
        .then(res => {
          const data = res.data.data;
          setStaff(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Failed to load staff for edit task:', err);
          setStaff([]);
        })
        .finally(() => setStaffLoading(false));
    }
  }, [open]);

  if (!task) return null;

  const taskId = (task._id || task.id) as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setIsSubmitting(true);
    try {
      const updates: any = {
        title: title.trim(),
        description: description.trim(),
        category,
        taskType,
        priority,
        status,
        dueDate: new Date(dueDate).toISOString(),
      };

      if (assignedTo && assignedTo !== 'unassigned') {
        updates.assignedTo = assignedTo;
      }

      // If remark is updated and differs from existing remark
      if (remark.trim() && remark.trim() !== (task.remark || '')) {
        updates.remark = remark.trim();
      }

      await updateTask(taskId, updates);
      onOpenChange(false);
      if (onTaskUpdated) onTaskUpdated();
      else fetchTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold">Edit Task</SheetTitle>
              <SheetDescription className="text-xs">
                Update task details, assignment, status, and remarks.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Task Title <span className="text-red-500">*</span></Label>
            <Input
              id="edit-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="e.g. Follow up with client / Complete report"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide task details, scope, or background..."
              rows={3}
            />
          </div>

          {/* Status & Priority in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status <span className="text-red-500">*</span></Label>
              <Select value={status} onValueChange={(val: TaskStatus) => setStatus(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Hold (Blocked)</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(val: TaskPriority) => setPriority(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Task Type in grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Sales', 'Operations', 'Content', 'Support', 'Follow-up'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['General', 'Call', 'Meeting', 'Email', 'Follow-up', 'Review', 'Approval', 'Documentation', 'Quotation', 'Data Entry', 'Content Creation', 'Customer Issue', 'Internal', 'Other'].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-due-date">Due Date <span className="text-red-500">*</span></Label>
            <Input
              id="edit-due-date"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder={staffLoading ? 'Loading employees...' : 'Select employee'} />
              </SelectTrigger>
              <SelectContent>
                {currentUser && (
                  <SelectItem value={currentUser.id}>
                    Myself ({currentUser.name})
                  </SelectItem>
                )}
                {!isTeamMember && <SelectItem value="unassigned">Unassigned</SelectItem>}
                {staff
                  .filter(u => u._id !== currentUser?.id && u.id !== currentUser?.id)
                  .map(user => (
                    <SelectItem key={user._id || user.id} value={user._id || user.id}>
                      {user.name} {user.email ? `(${user.email})` : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {isTeamMember && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3 text-primary" /> Tasks assigned to you appear in your Tasks tab.
              </p>
            )}
          </div>

          {/* Remark / Delay Note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Remark / Delay Reason <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">Admin & team can view</span>
            </div>
            <Textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder="e.g. Reason for hold, delay expected, or current progress note..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
