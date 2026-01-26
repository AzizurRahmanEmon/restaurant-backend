import express, { Request, Response } from 'express';
import Order from '../models/Order';
import Customer from '../models/Customer';
import Product from '../models/Product';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validateOrderCreate,
    validateIdParam,
    validateOrderUpdate,
    validateOrderStatus,
    validatePaymentStatus,
    validateDateRange,
    validateStatusFilter
} from '../middleware/validation';

const router = express.Router();

// @route GET /api/orders
// @desc Get all orders (Admin only)
// @access Private
router.get('/', protect, validateDateRange, validateStatusFilter, async (req: AuthRequest, res: Response) => {
    try {
        const { status, paymentStatus, startDate, endDate } = req.query;

        let query: any = {};

        // Filter by status (already validated by validateStatusFilter)
        if (status) query.status = status;

        // Filter by payment status
        if (paymentStatus) {
            const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
            if (!validPaymentStatuses.includes(paymentStatus as string)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment status filter'
                });
            }
            query.paymentStatus = paymentStatus;
        }

        // Filter by date range (already validated by validateDateRange)
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate as string);
            if (endDate) query.createdAt.$lte = new Date(endDate as string);
        }

        const orders = await Order.find(query)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name category image')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route GET /api/orders/stats
// @desc Get order statistics
// @access Private
router.get('/stats', protect, async (_req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalOrders = await Order.countDocuments();
        const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'delivered' });

        // Calculate total revenue
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Today's revenue
        const todayRevenueData = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    createdAt: { $gte: today }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);

        const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].total : 0;

        res.json({
            success: true,
            data: {
                totalOrders,
                todayOrders,
                pendingOrders,
                completedOrders,
                totalRevenue,
                todayRevenue,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route GET /api/orders/customer/:customerId
// @desc Get orders by customer
// @access Private
router.get('/customer/:customerId', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.find({ customer: req.params.customerId })
            .populate('items.product', 'name category image')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route GET /api/orders/:id
// @desc Get single order
// @access Private
router.get('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone address')
            .populate('items.product', 'name category image price');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route POST /api/orders
// @desc Create new order (Public - from frontend)
// @access Public
router.post('/', validateOrderCreate, async (req: Request, res: Response) => {
    try {
        const { customerId, items, deliveryType, deliveryAddress, paymentMethod, notes } = req.body;

        // Validate customer
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
            });
        }

        // Validate and calculate order details
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`,
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} is currently unavailable`,
                });
            }

            // Check stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} - only ${product.stock} items available`,
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                specialInstructions: item.specialInstructions || '',
            });

            // Reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Calculate tax (10%)
        const tax = subtotal * 0.10;

        // Calculate delivery fee
        let deliveryFee = 0;
        if (deliveryType === 'delivery') {
            deliveryFee = 50; // Fixed delivery fee
        }

        // Calculate total
        const totalAmount = subtotal + tax + deliveryFee;

        // Generate order number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const count = await Order.countDocuments();
        const orderNum = String(count + 1).padStart(4, '0');
        const orderNumber = `ORD-${year}${month}${day}-${orderNum}`;

        // Create order
        const order = await Order.create({
            orderNumber,
            customer: customerId,
            items: orderItems,
            subtotal,
            tax,
            deliveryFee,
            totalAmount,
            deliveryType,
            deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
            paymentMethod,
            notes,
            estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
        });

        // Add order to customer's order history
        customer.orderHistory.push(order._id);

        // Add loyalty points (1 point per 100 currency)
        customer.loyaltyPoints += Math.floor(totalAmount / 100);

        await customer.save();

        // Populate the order before returning
        const populatedOrder = await Order.findById(order._id)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name category image');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route PUT /api/orders/:id
// @desc Update order (Admin only)
// @access Private
router.put('/:id', protect, validateIdParam, validateOrderUpdate, async (req: AuthRequest, res: Response) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('customer', 'name email phone')
            .populate('items.product', 'name category image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        res.json({
            success: true,
            message: 'Order updated successfully',
            data: order,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route PATCH /api/orders/:id/status
// @desc Update order status
// @access Private
router.patch('/:id/status', protect, validateIdParam, validateOrderStatus, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route PATCH /api/orders/:id/payment
// @desc Update payment status
// @access Private
router.patch('/:id/payment', protect, validateIdParam, validatePaymentStatus, async (req: AuthRequest, res: Response) => {
    try {
        const { paymentStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        res.json({
            success: true,
            message: `Payment status updated to ${paymentStatus}`,
            data: order,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route DELETE /api/orders/:id
// @desc Cancel/Delete order
// @access Private
router.delete('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Only allow cancellation if order is pending or confirmed
        if (['preparing', 'ready', 'delivered'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`,
            });
        }

        // Restore stock for cancelled orders
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;