import mongoose, { Schema, Document } from 'mongoose';

export interface IPartner extends Document {
    icon: string;
    width: number;
    height: number;
    name?: string;
    isActive: boolean;
    displayOrder: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
    {
        icon: {
            type: String,
            required: [true, 'Partner icon is required'],
        },
        width: {
            type: Number,
            required: [true, 'Icon width is required'],
            min: 0,
        },
        height: {
            type: Number,
            required: [true, 'Icon height is required'],
            min: 0,
        },
        name: {
            type: String,
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
PartnerSchema.index({ isActive: 1 });
PartnerSchema.index({ displayOrder: 1 });

export default mongoose.model<IPartner>('Partner', PartnerSchema);