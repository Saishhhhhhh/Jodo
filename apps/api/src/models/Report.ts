import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'custom'], required: true },
  dateRange: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'completed' },
  data: { type: mongoose.Schema.Types.Mixed },
  downloadUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
