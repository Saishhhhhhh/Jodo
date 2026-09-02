import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

mediaSchema.index({ storeId: 1, createdAt: -1 });

export const Media = mongoose.model('Media', mediaSchema);
