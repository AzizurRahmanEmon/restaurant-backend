import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
    customer: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    date: Date;
    time: string;
    numberOfGuests: number;
    specialRequests?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    tableNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Reservation date is required'],
        },
        time: {
            type: String,
            required: [true, 'Reservation time is required'],
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time (HH:MM)'],
        },
        numberOfGuests: {
            type: Number,
            required: [true, 'Number of guests is required'],
            min: [1, 'At least 1 guest is required'],
            max: [20, 'Maximum 20 guests allowed'],
        },
        specialRequests: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
        },
        tableNumber: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Validate reservation date is in the future
ReservationSchema.pre('save', function()  {
    const reservationDateTime = new Date(this.date);
    const [hours, minutes] = this.time.split(':');
    reservationDateTime.setHours(parseInt(hours), parseInt(minutes));

    if (this.isNew && reservationDateTime < new Date()) {
        return (new Error('Reservation date and time must be in the future'));
    }
});

export default mongoose.model<IReservation>('Reservation', ReservationSchema);