"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const taskSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
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
        enum: ['Pending', 'In Progress', 'Blocked', 'Completed', 'Cancelled'],
        default: 'Pending',
        index: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium',
        index: true
    },
    assignedTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    team: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date },
    dueDate: { type: Date, index: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    blockedReason: { type: String },
    relatedToType: { type: String, enum: ['Order', 'Customer', 'Lead', 'Product', 'Ticket', 'Other'] },
    relatedToId: { type: mongoose_1.Schema.Types.ObjectId },
    activities: [
        {
            action: { type: String, required: true },
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            timestamp: { type: Date, default: Date.now },
            details: { type: mongoose_1.Schema.Types.Mixed }
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
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
            uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    tags: [{ type: String }],
    completedAt: { type: Date },
    completedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});
// Indexes for performance
taskSchema.index({ tenantId: 1, storeId: 1, status: 1 });
taskSchema.index({ tenantId: 1, storeId: 1, assignedTo: 1 });
taskSchema.index({ tenantId: 1, storeId: 1, category: 1 });
taskSchema.index({ tenantId: 1, storeId: 1, dueDate: 1 });
exports.Task = mongoose_1.default.models.Task || mongoose_1.default.model('Task', taskSchema);
//# sourceMappingURL=Task.js.map