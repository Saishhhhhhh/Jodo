import mongoose, { Schema, Document } from 'mongoose';

export interface IAiContentActivity extends Document {
  activityId: string;
  contentId?: string;
  activity: string;
  user: string;
  type: 'generated' | 'edited' | 'reviewed' | 'approved' | 'published' | 'regenerated' | 'rejected';
  metadata?: Record<string, any>;
  createdAt: Date;
}

const aiContentActivitySchema = new Schema<IAiContentActivity>(
  {
    activityId: { type: String, required: true, unique: true },
    contentId: { type: String, index: true },
    activity: { type: String, required: true },
    user: { type: String, default: 'Admin' },
    type: {
      type: String,
      enum: ['generated', 'edited', 'reviewed', 'approved', 'published', 'regenerated', 'rejected'],
      default: 'generated',
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AiContentActivity =
  mongoose.models.AiContentActivity ||
  mongoose.model<IAiContentActivity>('AiContentActivity', aiContentActivitySchema);
