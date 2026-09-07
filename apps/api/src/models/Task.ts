import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskCategory = 'Sales' | 'Operations' | 'Content' | 'Support' | 'Follow-up';
export type TaskType = 'General' | 'Call' | 'Meeting' | 'Email' | 'Follow-up' | 'Review' | 'Approval' | 'Documentation' | 'Quotation' | 'Data Entry' | 'Content Creation' | 'Customer Issue' | 'Internal' | 'Other';
export type TaskStatus = 'Pending' | 'In Progress' | 'Blocked' | 'Completed' | 'Cancelled' | 'Closed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ITaskActivity {
  action: string;
  user: Types.ObjectId;
  timestamp: Date;
  details?: any;
}

export interface ITaskChecklist {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ITaskComment {
  id: string;
  user: Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface ITaskRemark {
  id?: string;
  text: string;
  statusAtTime?: string;
  user: Types.ObjectId;
  userName?: string;
  createdAt: Date;
}

export interface ITaskAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface ITask extends Document {
  tenantId: Types.ObjectId;
  storeId: Types.ObjectId;
  title: string;
  description?: string;
  category: TaskCategory;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: Types.ObjectId;
  team?: string;
  createdBy: Types.ObjectId;
  startDate?: Date;
  dueDate?: Date;
  progress: number;
  blockedReason?: string;
  
  relatedToType?: 'Order' | 'Customer' | 'Lead' | 'Product' | 'Ticket' | 'Other';
  relatedToId?: Types.ObjectId;
  
  activities: ITaskActivity[];
  checklist: ITaskChecklist[];
  comments: ITaskComment[];
  attachments: ITaskAttachment[];
  tags: string[];

  remark?: string;
  remarkUpdatedAt?: Date;
  remarkUpdatedBy?: Types.ObjectId;
  remarks: ITaskRemark[];

  completedAt?: Date;
  completedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['Sales', 'Operations', 'Content', 'Support', 'Follow-up'],
      required: true,
      index: true
    },
    taskType: {
      type: String,
      enum: ['General', 'Call', 'Meeting', 'Email', 'Follow-up', 'Review', 'Approval', 'Documentation', 'Quotation', 'Data Entry', 'Content Creation', 'Customer Issue', 'Internal', 'Other'],
      default: 'General'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Blocked', 'Completed', 'Cancelled', 'Closed'],
      default: 'Pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    team: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date },
    dueDate: { type: Date, index: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    blockedReason: { type: String },
    
    relatedToType: { type: String, enum: ['Order', 'Customer', 'Lead', 'Product', 'Ticket', 'Other'] },
    relatedToId: { type: Schema.Types.ObjectId },
    
    activities: [
      {
        action: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: Schema.Types.Mixed }
      }
    ],
    checklist: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false }
      }
    ],
    comments: [
      {
        id: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    attachments: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    tags: [{ type: String }],
    
    remark: { type: String },
    remarkUpdatedAt: { type: Date },
    remarkUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: [
      {
        text: { type: String, required: true },
        statusAtTime: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    completedAt: { type: Date },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSchema.index({ tenantId: 1, storeId: 1, status: 1 });
taskSchema.index({ tenantId: 1, storeId: 1, assignedTo: 1 });
taskSchema.index({ tenantId: 1, storeId: 1, category: 1 });
taskSchema.index({ tenantId: 1, storeId: 1, dueDate: 1 });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
