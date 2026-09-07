import mongoose, { Document, Types } from 'mongoose';
export type TaskCategory = 'Sales' | 'Operations' | 'Content' | 'Support' | 'Follow-up';
export type TaskType = 'General' | 'Call' | 'Meeting' | 'Email' | 'Follow-up' | 'Review' | 'Approval' | 'Documentation' | 'Quotation' | 'Data Entry' | 'Content Creation' | 'Customer Issue' | 'Internal' | 'Other';
export type TaskStatus = 'Pending' | 'In Progress' | 'Blocked' | 'Completed' | 'Cancelled';
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
    completedAt?: Date;
    completedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Task: mongoose.Model<any, {}, {}, {}, any, any>;
