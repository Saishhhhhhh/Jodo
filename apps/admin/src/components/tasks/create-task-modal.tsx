'use client';

import React, { useState, useEffect } from 'react';
import { useTasksStore } from '@/stores/tasks';
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
import { Plus, User, MessageSquare } from 'lucide-react';

export function CreateTaskModal({ children, onTaskCreated }: { children?: React.ReactNode; onTaskCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const addTask = useTasksStore(state => state.addTask);
  const fetchTasks = useTasksStore(state => state.fetchTasks);
  const currentUser = useAuthStore(state => state.user);
  const isTeamMember = currentUser?.roles?.includes('TEAM_MEMBER');

  const [staff, setStaff] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sales');
  const [taskType, setTaskType] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [staffLoading, setStaffLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // If team member, default assignedTo to themselves
      if (currentUser?.id) {
        setAssignedTo(currentUser.id);
      }

      setStaffLoading(true);
      staffApi.list({ limit: 100 })
        .then(res => {
          const data = res.data.data;
          setStaff(Array.isArray(data) ? data : []);
        })
        .catch(err => {
          console.error('Failed to load staff:', err);
          setStaff([]);
        })
        .finally(() => setStaffLoading(false));
    }
  }, [open, currentUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !category) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title,
        description,
        category,
        taskType,
        priority,
        assignedTo: assignedTo || (currentUser?.id ? currentUser.id : undefined),
        dueDate: new Date(dueDate).toISOString(),
        remark: remark.trim() || undefined,
      });
      setOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo(currentUser?.id || '');
      setRemark('');
      if (onTaskCreated) onTaskCreated();
      else fetchTasks();
    } catch (error) {
      // toast shown in store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create Task
          </Button>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">
              Create New Task
            </SheetTitle>
            <SheetDescription>
              {isTeamMember
                ? 'Create a task for yourself. Your administrator will be notified and can view your progress and remarks.'
                : 'Fill in the details below to create and assign a new task.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label>Task Title <span className="text-red-500">*</span></Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="e.g. Follow up with client / Complete report"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide task details, scope, or background..."
                rows={3}
              />
            </div>

            {/* Category & Task Type in grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category <span className="text-red-500">*</span></Label>
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

            {/* Priority & Due Date in grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                />
              </div>
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
                  <User className="w-3 h-3 text-primary" /> This task will be assigned to your workspace.
                </p>
              )}
            </div>

            {/* Initial Remark / Delay Note */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  Initial Remark / Note <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">Admin will see this note</span>
              </div>
              <Textarea
                value={remark}
                onChange={e => setRemark(e.target.value)}
                placeholder="e.g. Self-assigned client task, initial progress notes, or any expected delay..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
