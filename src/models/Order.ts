import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}

export interface IOrder extends Document {
    orderNumber: string;
    customer: mongoose.Types.ObjectId;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentMethod: 'cash' | 'card' | 'online' | 'wallet';
    deliveryAddress?: string;
    deliveryType: 'delivery' | 'pickup' | 'dine-in';
    notes?: string;
    estimatedDeliveryTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema({
    product: { // Changed from menuItem
        type: Schema.Types.ObjectId,
        ref: 'Product', // Changed from MenuItem
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    specialInstructions: {
        type: String,
        trim: true,
    },
});

const OrderSchema = new Schema<IOrder>(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        items: {
            type: [OrderItemSchema],
            validate: {
                validator: function (items: IOrderItem[]) {
                    return items && items.length > 0;
                },
                message: 'Order must have at least one item',
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        deliveryFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'online', 'wallet'],
            required: true,
        },
        deliveryAddress: {
            type: String,
            trim: true,
        },
        deliveryType: {
            type: String,
            enum: ['delivery', 'pickup', 'dine-in'],
            default: 'delivery',
        },
        notes: {
            type: String,
            trim: true,
        },
        estimatedDeliveryTime: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Generate order number before saving
OrderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const count = await mongoose.model('Order').countDocuments();
        const orderNum = String(count + 1).padStart(4, '0');

        this.orderNumber = `ORD-${year}${month}${day}-${orderNum}`;
    }
});

export default mongoose.model<IOrder>('Order', OrderSchema);