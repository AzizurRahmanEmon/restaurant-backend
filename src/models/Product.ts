import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    salePrice?: number;
    image: string;
    images: string[];
    category: string;
    tags: string[];
    stock: number;
    rating: {
        stars: number;
        reviews: number;
    };
    isFeatured: boolean;
    isActive: boolean;
    preparationTime?: number;
    ingredients?: string[];
    allergens?: string[];
    nutritionInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        salePrice: {
            type: Number,
            min: [0, 'Sale price cannot be negative'],
        },
        image: {
            type: String,
            required: [true, 'Main image is required'],
        },
        images: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['coffee', 'grill', 'fast-food', 'breakfast', 'asian', 'american', 'italian', 'salads', 'main-course', 'mediterranean', 'european', 'beverages', 'desserts'],
        },
        tags: {
            type: [String],
            default: [],
        },
        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            min: 0,
            default: 0,
        },
        rating: {
            stars: {
                type: Number,
                min: 0,
                max: 5,
                default: 5,
            },
            reviews: {
                type: Number,
                min: 0,
                default: 0,
            },
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        preparationTime: {
            type: Number,
            min: 0,
        },
        ingredients: [String],
        allergens: [String],
        nutritionInfo: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only 3 featured items per category, minimum 1
ProductSchema.pre('save', async function () {
    if (this.isModified('isFeatured') && this.isFeatured) {
        const featuredCount = await mongoose.model('Product').countDocuments({
            category: this.category,
            isFeatured: true,
            _id: { $ne: this._id },
        });

        if (featuredCount >= 3) {
            return (new Error(`Maximum 3 featured products allowed per category. Category '${this.category}' already has 3 featured products.`));
        }
    }
});

// Generate slug from name if not provided
ProductSchema.pre('save', function () {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
});

export default mongoose.model<IProduct>('Product', ProductSchema);