import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  attachments: [{
    fileName: { type: String },
    fileUrl: { type: String }
  }]
}, { timestamps: true });

MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ recipient: 1, sender: 1 });

export default mongoose.model('Message', MessageSchema);
