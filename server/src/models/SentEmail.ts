import mongoose, { Document, Schema } from 'mongoose';

export interface ISentEmail extends Document {
  recipientEmail: string;
  recipientName?: string;
  company?: string;
  jobRole?: string;
  purpose: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  status: 'Sent' | 'Failed';
  messageId?: string;
  threadId?: string;
  errorMessage?: string;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SentEmailSchema = new Schema<ISentEmail>(
  {
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    recipientName: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    jobRole: {
      type: String,
      trim: true,
      default: '',
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
      default: 'Job Application',
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    bodyText: {
      type: String,
      required: true,
    },
    bodyHtml: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Sent', 'Failed'],
      default: 'Sent',
      index: true,
    },
    messageId: {
      type: String,
      default: '',
    },
    threadId: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SentEmail = mongoose.model<ISentEmail>('SentEmail', SentEmailSchema);
