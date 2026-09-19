'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasksStore, TaskStatus } from '@/stores/tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  CheckSquare, 
  Send, 
  Tag, 
  AlertCircle, 
  AlertTriangle,
  History, 
  User, 
  CheckCircle2, 
  MessageSquarePlus,
  Pencil
} from 'lucide-react';
import { format } from 'date-fns';
import { StatusRemarkModal } from '@/components/tasks/status-remark-modal';
import { EditTaskModal } from '@/components/tasks/edit-task-modal';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  
  const { tasks, fetchTasks, updateTask, addActivity, toggleChecklistItem } = useTasksStore();
  const task = tasks.find((t: any) => (t._id || t.id) === taskId);

  const [comment, setComment] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [remarkStatus, setRemarkStatus] = useState<TaskStatus | ''>('');
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<TaskStatus | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [fetchTasks, tasks.length]);

  if (!task) {
    return (
      <div className="p-12 text-center text-muted-foreground space-y-3">
        <AlertCircle className="w-10 h-10 mx-auto opacity-50 text-muted-foreground" />
        <p className="text-base">Task not found or still loading...</p>
        <Button variant="outline" onClick={() => router.back()}>Go back to tasks</Button>
      </div>
    );
  }

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed' && task.status !== 'Closed';
  const isDelayed = task.status === 'Blocked' || isOverdue;

  const handleOpenStatusModal = (status: TaskStatus) => {
    setModalStatus(status);
    setIsModalOpen(true);
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addActivity((task as any)._id || task.id, {
      user: 'Current User',
      action: `commented: "${comment}"`,
      details: { message: comment }
    });
    setComment('');
  };

  const handleSubmitRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim()) return;

    setIsSubmittingRemark(true);
    try {
      const updates: any = { remark: newRemark.trim() };
      if (remarkStatus && remarkStatus !== task.status) {
        updates.status = remarkStatus;
      }
      await updateTask((task as any)._id || task.id, updates);
      setNewRemark('');
      setRemarkStatus('');
    } catch (err) {
      console.error('Failed to submit remark', err);
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">ID: {(task as any)._id || task.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit Task
          </Button>
          <Button onClick={() => handleOpenStatusModal(task.status)} className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Update Status & Remark
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Employee Remark & Delay Reason Card (Prominent for Admin and Employee) */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Employee Remarks & Delay Reasons
                </CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  {task.remarks?.length || (task.remark ? 1 : 0)} record(s)
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Explanations for task delays, progress bottlenecks, or deliverable updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Latest Remark Highlight */}
              {task.remark ? (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDelayed
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-muted/40 border-border text-foreground'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      {isDelayed ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400">Current Delay Reason</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Latest Employee Remark</span>
                        </>
                      )}
                    </span>
                    {task.remarkUpdatedAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.remarkUpdatedAt), 'MMM d, yyyy • h:mm a')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm italic font-medium leading-relaxed">
                    "{task.remark}"
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Posted by <strong className="text-foreground">{task.remarkUpdatedBy?.name || (task as any).assignedTo?.name || 'Team Member'}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                  No remark has been provided for this task yet.
                </div>
              )}

              {/* Add New Remark Form */}
              <form onSubmit={handleSubmitRemark} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MessageSquarePlus className="w-4 h-4 text-primary" /> Add a New Remark / Delay Note
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Update status to:</span>
                    <Select value={remarkStatus} onValueChange={(val: TaskStatus) => setRemarkStatus(val)}>
                      <SelectTrigger className="h-7 text-xs w-[130px]">
                        <SelectValue placeholder={task.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Blocked / Delayed</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Textarea
                  placeholder="Explain why this task will be delayed, current progress blockers, or completion notes..."
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                  className="min-h-[80px] text-sm resize-y"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setNewRemark('Delayed: Waiting for client feedback/assets')}
                      className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted text-muted-foreground"
                    >
                      Client Feedback
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRemark('Delayed: Technical blocker encountered')}
                      className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted text-muted-foreground"
                    >
                      Tech Blocker
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRemark('In Progress: Currently being tested')}
                      className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted text-muted-foreground"
                    >
                      Testing
                    </button>
                  </div>
                  <Button type="submit" size="sm" disabled={!newRemark.trim() || isSubmittingRemark}>
                    {isSubmittingRemark ? 'Submitting...' : 'Post Remark'}
                  </Button>
                </div>
              </form>

              {/* Remarks History Timeline */}
              {task.remarks && task.remarks.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" /> Remark History ({task.remarks.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {task.remarks.slice().reverse().map((r, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {r.userName || r.user?.name || 'Team Member'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy • h:mm a') : ''}
                          </span>
                        </div>
                        {r.statusAtTime && (
                          <Badge variant="outline" className="text-[9px] py-0 h-4">
                            Status: {r.statusAtTime}
                          </Badge>
                        )}
                        <p className="text-xs text-foreground/90 italic pt-0.5">"{r.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description & Checklist Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Description</h3>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
              </div>

              {task.checklist && task.checklist.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-primary" /> Checklist
                  </h3>
                  <div className="space-y-2">
                    {task.checklist.map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`check-${item.id}`} 
                          checked={item.completed} 
                          onCheckedChange={() => toggleChecklistItem((task as any)._id || task.id, item.id)}
                        />
                        <label 
                          htmlFor={`check-${item.id}`}
                          className={`text-sm font-medium leading-none cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}
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
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Related To
                  </h3>
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{task.relatedTo}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity & Comments */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Activity & Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.activities?.map((activity, i) => {
                  const resolvedUser = (() => {
                    const u = (activity as any).user;
                    if (u && typeof u === 'object' && u.name) return u.name;
                    if (typeof u === 'string') {
                      if (/^[0-9a-fA-F]{24}$/.test(u)) {
                        if ((task as any).assignedTo?.name && String((task as any).assignedTo._id || (task as any).assignedTo.id) === u) return (task as any).assignedTo.name;
                        if ((task as any).createdBy?.name && String((task as any).createdBy._id || (task as any).createdBy.id) === u) return (task as any).createdBy.name;
                        return 'Team Member';
                      }
                      return u;
                    }
                    return 'System';
                  })();

                  return (
                    <div key={activity.id || i} className="p-3 rounded-lg border border-border bg-card/50 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {resolvedUser.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{resolvedUser}</span>
                          <time className="text-[10px] text-muted-foreground">
                            {activity.timestamp ? format(new Date(activity.timestamp), 'MMM d, h:mm a') : ''}
                          </time>
                        </div>
                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-2">
                <Input 
                  placeholder="Add a comment or internal note..." 
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

        {/* Sidebar Details Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <Select value={task.status} onValueChange={(v: TaskStatus) => handleOpenStatusModal(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Hold (Blocked)</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {task.remark && (
                <div className="space-y-1 p-2.5 rounded-lg bg-muted/40 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Latest Remark</p>
                  <p className="text-xs text-foreground italic">"{task.remark}"</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Assigned To</p>
                <p className="text-sm font-medium">{(task as any).assignedTo?.name || (task as any).assignedTo || 'Unassigned'}</p>
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
                <p className="text-sm">{task.department || 'Operations'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Created By</p>
                <p className="text-sm">{(task as any).createdBy?.name || task.createdBy || 'Admin'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={task}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      {/* Status and Remark Modal */}
      <StatusRemarkModal
        task={task}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialStatus={modalStatus}
      />
    </div>
  );
}
