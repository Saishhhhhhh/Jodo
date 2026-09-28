import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  tenantId: Types.ObjectId;
  storeId: Types.ObjectId;
  sender: string;
  senderId?: Types.ObjectId;
  content: string;
  relatedModule?: 'Task' | 'Order' | 'Customer' | 'Return' | 'Product' | 'Complaint';
  relatedRecordId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    sender: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    relatedModule: { 
      type: String, 
      enum: ['Task', 'Order', 'Customer', 'Return', 'Product', 'Complaint'] 
    },
    relatedRecordId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);
