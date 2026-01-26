import mongoose, { Schema, Document } from 'mongoose';

export interface IChef extends Document {
    name: string;
    title: string;
    specialty: string;
    label: string;
    imgSrc: string;
    altText: string;
    profileLink: string;
    socialLinks: {
        linkedin: string;
        facebook: string;
        twitter: string;
    };
    isActive: boolean;
    displayOrder: number;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ChefSchema = new Schema<IChef>(
    {
        name: {
            type: String,
            required: [true, 'Chef name is required'],
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Chef title is required'],
            trim: true,
        },
        specialty: {
            type: String,
            required: [true, 'Chef specialty is required'],
            trim: true,
        },
        label: {
            type: String,
            trim: true,
            default: '',
        },
        imgSrc: {
            type: String,
            required: [true, 'Chef image is required'],
            default: 'default-chef.jpg',
        },
        altText: {
            type: String,
            required: [true, 'Image alt text is required'],
            trim: true,
        },
        profileLink: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        socialLinks: {
            linkedin: {
                type: String,
                trim: true,
                default: '',
            },
            facebook: {
                type: String,
                trim: true,
                default: '',
            },
            twitter: {
                type: String,
                trim: true,
                default: '',
            },
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
            required: false, // Changed to optional
        },
    },
    {
        timestamps: true,
    }
);

// Generate profileLink from name if not provided
ChefSchema.pre('save', function () {
    if (!this.profileLink && this.name) {
        this.profileLink = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

// Indexes for faster queries
ChefSchema.index({ name: 1 });
ChefSchema.index({ isActive: 1 });
ChefSchema.index({ displayOrder: 1 });
ChefSchema.index({ profileLink: 1 });

export default mongoose.model<IChef>('Chef', ChefSchema);