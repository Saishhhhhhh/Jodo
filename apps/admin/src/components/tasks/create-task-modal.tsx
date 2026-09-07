'use client';

import React, { useState, useEffect } from 'react';
import { useTasksStore } from '@/stores/tasks';
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
import { Plus } from 'lucide-react';

export function CreateTaskModal({ children, onTaskCreated }: { children?: React.ReactNode; onTaskCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const addTask = useTasksStore(state => state.addTask);
  const fetchTasks = useTasksStore(state => state.fetchTasks);

  const [staff, setStaff] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sales');
  const [taskType, setTaskType] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [staffLoading, setStaffLoading] = useState(false);

  useEffect(() => {
    if (open) {
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
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !category) return;

    try {
      await addTask({
        title,
        description,
        category,
        taskType,
        priority,
        assignedTo: assignedTo || undefined,
        dueDate: new Date(dueDate).toISOString(),
      });
      setOpen(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo('');
      if (onTaskCreated) onTaskCreated();
      else fetchTasks();
    } catch (error) {
      // toast shown in store
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">Create New Task</SheetTitle>
            <SheetDescription>
              Fill in the details below to create and assign a new task.
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
                placeholder="e.g. Follow up with client"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Provide task details..."
                rows={4}
              />
            </div>

            {/* Category */}
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

            {/* Task Type */}
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

            {/* Priority */}
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

            {/* Assigned To */}
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder={staffLoading ? 'Loading employees...' : 'Select employee'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staffLoading && (
                    <SelectItem value="_loading" disabled>Loading employees...</SelectItem>
                  )}
                  {!staffLoading && staff.length === 0 && (
                    <SelectItem value="_empty" disabled>No employees found</SelectItem>
                  )}
                  {staff.map(user => (
                    <SelectItem key={user._id || user.id} value={user._id || user.id}>
                      {user.name} {user.email ? `(${user.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Task
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
