import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied' | 'archived';
    isImportant: boolean;
    repliedAt?: Date;
    repliedBy?: string;
    replyMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['unread', 'read', 'replied', 'archived'],
            default: 'unread',
        },
        isImportant: {
            type: Boolean,
            default: false,
        },
        repliedAt: {
            type: Date,
        },
        repliedBy: {
            type: String,
        },
        replyMessage: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
MessageSchema.index({ status: 1 });
MessageSchema.index({ email: 1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ isImportant: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);