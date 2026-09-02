import mongoose from 'mongoose';

const navigationItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  url: { type: String, required: true },
});

const navigationSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    title: { type: String, required: true },
    handle: { type: String, required: true },
    items: [navigationItemSchema],
  },
  { timestamps: true }
);

// Ensure a store doesn't have duplicate navigation handles
navigationSchema.index({ storeId: 1, handle: 1 }, { unique: true });

export const Navigation = mongoose.model('Navigation', navigationSchema);
