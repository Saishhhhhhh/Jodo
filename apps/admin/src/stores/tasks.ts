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

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  department: Department;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  startDate?: string;
  dueDate: string;
  dueTime?: string;
  relatedTo?: string; // e.g. Lead: ABC Pvt Ltd
  tags: string[];
  checklist: TaskChecklistItem[];
  activities: TaskActivity[];
}

interface TasksState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'activities'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addActivity: (taskId: string, activity: Omit<TaskActivity, 'id' | 'timestamp'>) => void;
  toggleChecklistItem: (taskId: string, checklistItemId: string) => void;
}

// Initial Mock Data
const MOCK_TASKS: Task[] = [
  {
    id: 'JODO-TASK-10452',
    title: 'Follow up with ABC Pvt Ltd',
    description: 'Call the customer to discuss the recent quotation.',
    type: 'Follow-up',
    department: 'Sales',
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Rahul',
    createdBy: 'Amit',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    dueTime: '17:00',
    tags: ['Customer', 'Follow-up'],
    checklist: [
      { id: '1', label: 'Call customer', completed: false },
      { id: '2', label: 'Prepare quotation', completed: true },
    ],
    activities: [
      { id: 'a1', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Amit', action: 'created this task' },
    ]
  },
  {
    id: 'JODO-TASK-10453',
    title: 'Update CRM for Q3 Deals',
    description: 'Ensure all deals for Q3 are properly tracked and updated in the system.',
    type: 'Admin',
    department: 'Sales',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Rahul',
    createdBy: 'System',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    dueDate: new Date(Date.now() - 3600000).toISOString(), // Overdue
    tags: ['CRM', 'Quarterly'],
    checklist: [],
    activities: [
      { id: 'a1', timestamp: new Date(Date.now() - 172800000).toISOString(), user: 'System', action: 'created this task' },
      { id: 'a2', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'Rahul', action: 'changed status to In Progress' },
    ]
  }
];

export const useTasksStore = create<TasksState>((set) => ({
  tasks: MOCK_TASKS,
  addTask: (taskData) => set((state) => {
    const newTask: Task = {
      ...taskData,
      id: `JODO-TASK-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      activities: [
        {
          id: Math.random().toString(),
          timestamp: new Date().toISOString(),
          user: taskData.createdBy,
          action: 'created this task'
        }
      ]
    };
    return { tasks: [newTask, ...state.tasks] };
  }),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => (t.id === id ? { ...t, ...updates } : t))
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  addActivity: (taskId, activityData) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          activities: [
            ...t.activities,
            { ...activityData, id: Math.random().toString(), timestamp: new Date().toISOString() }
          ]
        };
      }
      return t;
    })
  })),
  toggleChecklistItem: (taskId, checklistItemId) => set((state) => ({
    tasks: state.tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          checklist: t.checklist.map(c => c.id === checklistItemId ? { ...c, completed: !c.completed } : c)
        };
      }
      return t;
    })
  }))
}));
