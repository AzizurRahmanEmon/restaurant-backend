import mongoose, { Schema, Document } from 'mongoose';

export interface IBusinessHours {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
}

export interface INotifications {
    newOrders: boolean;
    newReservations: boolean;
    lowStockAlerts: boolean;
    newMessages: boolean;
}

export interface ISocialMedia {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
}

export interface ISettings extends Document {
    restaurantName: string;
    email: string;
    phone: string;
    address: string;
    description?: string;
    logo?: string;
    businessHours: IBusinessHours[];
    notifications: INotifications;
    socialMedia: ISocialMedia;
    currency: string;
    timezone: string;
    taxRate: number;
    deliveryFee: number;
    minimumOrderAmount: number;
    allowOnlineOrdering: boolean;
    allowReservations: boolean;
    updatedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BusinessHoursSchema = new Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    open: {
        type: String,
        default: '09:00',
    },
    close: {
        type: String,
        default: '22:00',
    },
    isClosed: {
        type: Boolean,
        default: false,
    },
});

const NotificationsSchema = new Schema({
    newOrders: {
        type: Boolean,
        default: true,
    },
    newReservations: {
        type: Boolean,
        default: true,
    },
    lowStockAlerts: {
        type: Boolean,
        default: true,
    },
    newMessages: {
        type: Boolean,
        default: true,
    },
});

const SocialMediaSchema = new Schema({
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
});

const SettingsSchema = new Schema<ISettings>(
    {
        restaurantName: {
            type: String,
            required: [true, 'Restaurant name is required'],
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
            required: [true, 'Phone is required'],
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        logo: {
            type: String,
        },
        businessHours: {
            type: [BusinessHoursSchema],
            default: [
                { day: 'Monday', open: '09:00', close: '22:00', isClosed: false },
                { day: 'Tuesday', open: '09:00', close: '22:00', isClosed: false },
                { day: 'Wednesday', open: '09:00', close: '22:00', isClosed: false },
                { day: 'Thursday', open: '09:00', close: '22:00', isClosed: false },
                { day: 'Friday', open: '09:00', close: '22:00', isClosed: false },
                { day: 'Saturday', open: '09:00', close: '22:00', isClosed: false },
                { day: 'Sunday', open: '09:00', close: '22:00', isClosed: false },
            ],
        },
        notifications: {
            type: NotificationsSchema,
            default: {
                newOrders: true,
                newReservations: true,
                lowStockAlerts: true,
                newMessages: true,
            },
        },
        socialMedia: {
            type: SocialMediaSchema,
            default: {},
        },
        currency: {
            type: String,
            default: 'USD',
        },
        timezone: {
            type: String,
            default: 'America/New_York',
        },
        taxRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        deliveryFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        minimumOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        allowOnlineOrdering: {
            type: Boolean,
            default: true,
        },
        allowReservations: {
            type: Boolean,
            default: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one settings document exists
SettingsSchema.index({}, { unique: true });

export default mongoose.model<ISettings>('Settings', SettingsSchema);