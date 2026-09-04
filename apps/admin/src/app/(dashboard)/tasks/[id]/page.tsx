'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasksStore, TaskStatus } from '@/stores/tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, MessageSquare, Paperclip, CheckSquare, Send, Tag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  
  const task = useTasksStore(state => state.tasks.find(t => t.id === taskId));
  const updateTask = useTasksStore(state => state.updateTask);
  const addActivity = useTasksStore(state => state.addActivity);
  const toggleChecklist = useTasksStore(state => state.toggleChecklistItem);

  const [comment, setComment] = useState('');

  if (!task) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Task not found.</p>
        <Button variant="link" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask(task.id, { status: newStatus });
    addActivity(task.id, {
      user: 'Current User',
      action: `changed status to ${newStatus}`
    });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addActivity(task.id, {
      user: 'Current User',
      action: `commented: "${comment}"`
    });
    setComment('');
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed' && task.status !== 'Closed';

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{task.title}</h1>
            <Badge variant={task.status === 'Completed' || task.status === 'Closed' ? 'success' : task.status === 'Blocked' ? 'destructive' : 'secondary'}>
              {task.status}
            </Badge>
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">{task.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Description</h3>
                <p className="text-sm">{task.description || 'No description provided.'}</p>
              </div>

              {task.checklist.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" /> Checklist
                  </h3>
                  <div className="space-y-2">
                    {task.checklist.map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`check-${item.id}`} 
                          checked={item.completed} 
                          onCheckedChange={() => toggleChecklist(task.id, item.id)}
                        />
                        <label 
                          htmlFor={`check-${item.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.relatedTo && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Related To
                  </h3>
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{task.relatedTo}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Activity & Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {task.activities.map((activity, i) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {activity.user.charAt(0)}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">{activity.user}</h4>
                        <time className="text-[10px] text-muted-foreground">{format(new Date(activity.timestamp), 'MMM d, h:mm a')}</time>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <Input 
                  placeholder="Add a comment..." 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <Select value={task.status} onValueChange={(v: TaskStatus) => handleStatusChange(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned To</p>
                <p className="text-sm font-medium">{task.assignedTo}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority</p>
                <Badge variant="outline">{task.priority}</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Due Date</p>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>
                    {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                    {task.dueTime && ` at ${task.dueTime}`}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Department</p>
                <p className="text-sm">{task.department}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Created By</p>
                <p className="text-sm">{task.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
