import mongoose, { Schema, Document } from 'mongoose';

export interface IGallery extends Document {
    img: string;
    width: number;
    height: number;
    title: string;
    category: string;
    desc: string;
    span: string;
    isActive: boolean;
    displayOrder: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
    {
        img: {
            type: String,
            required: [true, 'Gallery image is required'],
        },
        width: {
            type: Number,
            required: [true, 'Image width is required'],
            min: 0,
        },
        height: {
            type: Number,
            required: [true, 'Image height is required'],
            min: 0,
        },
        title: {
            type: String,
            required: [true, 'Gallery title is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true,
        },
        desc: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        span: {
            type: String,
            default: '',
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
GallerySchema.index({ category: 1 });
GallerySchema.index({ isActive: 1 });
GallerySchema.index({ displayOrder: 1 });

export default mongoose.model<IGallery>('Gallery', GallerySchema);