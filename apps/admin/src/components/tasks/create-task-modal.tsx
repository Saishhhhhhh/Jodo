import React, { useState } from 'react';
import { useTasksStore, TaskPriority, TaskType, Department, TaskStatus } from '@/stores/tasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

export function CreateTaskModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const addTask = useTasksStore(state => state.addTask);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('Sales');
  const [department, setDepartment] = useState<Department>('Sales');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [assignedTo, setAssignedTo] = useState('Rahul');
  const [dueDate, setDueDate] = useState('');
  const [relatedTo, setRelatedTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    addTask({
      title,
      description,
      type,
      department,
      priority,
      status,
      assignedTo,
      dueDate: new Date(dueDate).toISOString(),
      createdBy: 'Current User',
      tags: [],
      checklist: [],
      relatedTo: relatedTo || undefined,
    });
    setOpen(false);
    
    // reset
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button><Plus className="w-4 h-4 mr-2" /> Create Task</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Task Title <span className="text-red-500">*</span></Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Follow up with client" />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide task details..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={type} onValueChange={(v: TaskType) => setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Sales', 'Operations', 'Content', 'Support', 'Follow-up', 'Finance', 'Admin', 'HR', 'Other'].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={(v: Department) => setDepartment(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Sales', 'Operations', 'Content', 'Support', 'Finance', 'Admin', 'HR'].map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v: TaskPriority) => setPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Critical', 'High', 'Medium', 'Low'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rahul">Rahul</SelectItem>
                  <SelectItem value="Amit">Amit</SelectItem>
                  <SelectItem value="Neha">Neha</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Due Date <span className="text-red-500">*</span></Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Related To (Optional)</Label>
              <Input value={relatedTo} onChange={e => setRelatedTo(e.target.value)} placeholder="e.g. Lead: ABC Pvt Ltd" />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
