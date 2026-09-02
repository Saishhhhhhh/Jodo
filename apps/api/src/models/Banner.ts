import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    image: { type: String, required: true },
    tagline: { type: String, required: true },
    heading: { type: String, required: true },
    subtext: { type: String, required: true },
    buttonText: { type: String, default: 'Discover Now' },
    buttonUrl: { type: String, default: '/shop' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Add index for fast retrieval by store
bannerSchema.index({ storeId: 1, status: 1, order: 1 });

export const Banner = mongoose.model('Banner', bannerSchema);
