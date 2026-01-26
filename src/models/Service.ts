import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
    img: string;
    title: string;
    description: string;
    isActive: boolean;
    displayOrder: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
    {
        img: {
            type: String,
            required: [true, 'Service icon is required'],
        },
        title: {
            type: String,
            required: [true, 'Service title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Service description is required'],
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ displayOrder: 1 });

export default mongoose.model<IService>('Service', ServiceSchema);