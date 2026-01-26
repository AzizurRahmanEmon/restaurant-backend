import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    img: string;
    descImg: string;
    date: Date;
    link: string;
    category: string;
    tags: string[];
    content: string;
    excerpt: string;
    author: mongoose.Types.ObjectId;
    status: 'draft' | 'published' | 'archived';
    views: number;
    likes: number;
    isFeatured: boolean;
    readTime: number;
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
    {
        title: {
            type: String,
            required: [true, 'Blog title is required'],
            trim: true,
        },
        img: {
            type: String,
            required: [true, 'Blog image is required'],
        },
        descImg: {
            type: String,
            required: [true, 'Blog description image is required'],
        },
        date: {
            type: Date,
            default: Date.now,
        },
        link: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Blog category is required'],
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        content: {
            type: String,
            required: [true, 'Blog content is required'],
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: 300,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        readTime: {
            type: Number,
            default: 5,
        },
    },
    {
        timestamps: true,
    }
);

// Generate link from title
BlogSchema.pre('save', function () {
    if (this.isModified('title') && !this.link) {
        this.link = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Calculate read time based on content (avg 200 words per minute)
    if (this.isModified('content')) {
        const wordCount = this.content.split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / 200);
    }
});

// Indexes for faster queries
BlogSchema.index({ link: 1 });
BlogSchema.index({ status: 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ date: -1 });
BlogSchema.index({ isFeatured: 1 });
BlogSchema.index({ tags: 1 });

export default mongoose.model<IBlog>('Blog', BlogSchema);