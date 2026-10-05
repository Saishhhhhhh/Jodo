import mongoose from 'mongoose';

export interface IFAQ {
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'active' | 'inactive';
}

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'general' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

faqSchema.index({ status: 1, category: 1, order: 1 });

export const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
