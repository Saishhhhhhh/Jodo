import { create } from 'zustand';

export type TaskStatus = 'Pending' | 'In Progress' | 'Blocked' | 'Completed' | 'Closed';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskType = 'Sales' | 'Operations' | 'Content' | 'Support' | 'Follow-up' | 'Finance' | 'Admin' | 'HR' | 'Other';
export type Department = 'Sales' | 'Operations' | 'Content' | 'Support' | 'Finance' | 'Admin' | 'HR';

export interface TaskChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface TaskActivity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface TaskRemark {
  id?: string;
  text: string;
  statusAtTime?: string;
  user?: any;
  userName?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type?: TaskType;
  department: Department | string;
  category?: string;
  taskType?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: any;
  createdBy: any;
  createdAt: string;
  startDate?: string;
  dueDate: string;
  dueTime?: string;
  relatedTo?: string; // e.g. Lead: ABC Pvt Ltd
  tags?: string[];
  checklist?: TaskChecklistItem[];
  activities?: TaskActivity[];
  remark?: string;
  remarkUpdatedAt?: string;
  remarkUpdatedBy?: any;
  remarks?: TaskRemark[];
  completedAt?: string;
  completedBy?: any;
  progress?: number;

  // Rich Task Management fields
  clientName?: string;
  projectName?: string;
  clientBrief?: string;
  projectDeliverable?: string;
  driveUrl?: string;
  estimatedHours?: string;
  isUrgent?: boolean;
  loggedDuration?: number; // In seconds
  timerStartedAt?: string;
  timerRunning?: boolean;
  team?: string;
}

interface TasksState {
  tasks: Task[];
  fetchTasks: (params?: any) => Promise<void>;
  addTask: (task: any) => Promise<void>;
  updateTask: (id: string, updates: any) => Promise<void>;
  toggleTimer: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  reopenTask: (id: string) => Promise<void>;
  updateDuration: (id: string, durationSeconds: number) => Promise<void>;
  addRemark: (id: string, remark: string, status?: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addActivity: (taskId: string, activity: any) => Promise<void>;
  toggleChecklistItem: (taskId: string, checklistItemId: string) => Promise<void>;
}

import { tasksApi } from '../lib/api-client';
import { toast } from 'sonner';

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  fetchTasks: async (params) => {
    try {
      const res = await tasksApi.list(params);
      set({ tasks: res.data.data });
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      toast.error('Failed to fetch tasks');
    }
  },
  addTask: async (taskData) => {
    try {
      const res = await tasksApi.create(taskData);
      set((state) => ({ tasks: [res.data.data, ...state.tasks] }));
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    }
  },
  updateTask: async (id, updates) => {
    try {
      const res = await tasksApi.update(id, updates);
      set((state) => ({
        tasks: state.tasks.map((t: any) => ((t._id || t.id) === id ? res.data.data : t))
      }));
      toast.success('Task updated');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update task';
      toast.error(msg);
      throw error;
    }
  },
  toggleTimer: async (id) => {
    const task = get().tasks.find((t: any) => (t._id || t.id) === id);
    if (!task) return;

    try {
      if (task.timerRunning) {
        // Stop timer: calculate additional elapsed seconds
        let additionalSeconds = 0;
        if (task.timerStartedAt) {
          const started = new Date(task.timerStartedAt).getTime();
          const now = Date.now();
          additionalSeconds = Math.max(0, Math.floor((now - started) / 1000));
        }
        const newDuration = (task.loggedDuration || 0) + additionalSeconds;
        const res = await tasksApi.update(id, {
          timerRunning: false,
          loggedDuration: newDuration,
        });
        set((state) => ({
          tasks: state.tasks.map((t: any) => ((t._id || t.id) === id ? res.data.data : t))
        }));
        toast.info('Timer paused');
      } else {
        // Start timer & transition from Pending to In Progress
        const res = await tasksApi.update(id, {
          timerRunning: true,
          timerStartedAt: new Date().toISOString(),
          status: task.status === 'Pending' ? 'In Progress' : task.status,
        });
        set((state) => ({
          tasks: state.tasks.map((t: any) => ((t._id || t.id) === id ? res.data.data : t))
        }));
        toast.success('Timer started');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update timer';
      toast.error(msg);
    }
  },
  completeTask: async (id) => {
    const task = get().tasks.find((t: any) => (t._id || t.id) === id);
    if (!task) return;

    try {
      let newDuration = task.loggedDuration || 0;
      if (task.timerRunning && task.timerStartedAt) {
        const started = new Date(task.timerStartedAt).getTime();
        const now = Date.now();
        const additional = Math.max(0, Math.floor((now - started) / 1000));
        newDuration += additional;
      }

      const res = await tasksApi.update(id, {
        status: 'Completed',
        timerRunning: false,
        loggedDuration: newDuration,
        completedAt: new Date().toISOString(),
      });

      set((state) => ({
        tasks: state.tasks.map((t: any) => ((t._id || t.id) === id ? res.data.data : t))
      }));
      toast.success(`Task marked as Completed!`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to complete task';
      toast.error(msg);
    }
  },
  reopenTask: async (id) => {
    const task = get().tasks.find((t: any) => (t._id || t.id) === id);
    if (!task) return;

    try {
      const res = await tasksApi.update(id, {
        status: 'In Progress',
      });

      set((state) => ({
        tasks: state.tasks.map((t: any) => ((t._id || t.id) === id ? res.data.data : t))
      }));
      toast.success(`Task re-opened and set to In Progress`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to re-open task';
      toast.error(msg);
    }
  },
  updateDuration: async (id, durationSeconds) => {
    try {
      const res = await tasksApi.update(id, {
        loggedDuration: durationSeconds,
      });
      set((state) => ({
        tasks: state.tasks.map((t: any) => ((t._id || t.id) === id ? res.data.data : t))
      }));
      toast.success('Duration updated successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update duration';
      toast.error(msg);
      throw error;
    }
  },
  addRemark: async (id, remark, status) => {
    try {
      const res = await tasksApi.addRemark(id, { remark, status });
      set((state) => ({
        tasks: state.tasks.map((t: any) => ((t._id || t.id) === id ? res.data.data : t))
      }));
      toast.success('Remark added successfully');
    } catch (error) {
      toast.error('Failed to add remark');
      throw error;
    }
  },
  deleteTask: async (id) => {
    try {
      await tasksApi.delete(id);
      set((state) => ({
        tasks: state.tasks.filter((t: any) => (t._id || t.id) !== id)
      }));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
      throw error;
    }
  },
  addActivity: async (taskId, activityData) => {
    // Activities are mostly auto-generated by the backend, 
    // but if it's a comment, we use the addComment API.
    if (activityData.action === 'commented') {
      try {
        const res = await tasksApi.addComment(taskId, { message: (activityData as any).details?.message || activityData.action });
        // Refetch or update local state manually
        // For simplicity, we just update the specific task's comments in the state if needed, 
        // but ideally we should fetch the task again.
        get().fetchTasks(); 
      } catch (error) {
        toast.error('Failed to add comment');
      }
    }
  },
  toggleChecklistItem: async (taskId, checklistItemId) => {
    try {
      // Find current item
      const task = get().tasks.find((t: any) => (t._id || t.id) === taskId);
      const item = task?.checklist?.find(c => c.id === checklistItemId);
      if (!item) return;

      await tasksApi.updateChecklist(taskId, { id: checklistItemId, isCompleted: !item.completed });
      get().fetchTasks();
    } catch (error) {
      toast.error('Failed to update checklist');
    }
  }
}));
