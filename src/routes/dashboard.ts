import express, { Response } from 'express';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import Product from '../models/Product';
import Order from '../models/Order';
import Reservation from '../models/Reservation';
import Customer from '../models/Customer';
import Message from '../models/Message';
import Blog from '../models/Blog';
import Chef from '../models/Chef';
import Gallery from '../models/Gallery';

const router = express.Router();

// Simple in-memory cache for dashboard stats
// Initialize with an empty object instead of null
const dashboardCache: { data: any; timestamp: number } = {
    data: null,
    timestamp: 0
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// @route   GET /api/dashboard/stats
// @desc    Get Comprehensive Dashboard Statistics
// @access  Private (Admin only)
router.get('/stats', protect, async (req: AuthRequest, res: Response) => {
    try {
        // Check cache first
        const now = Date.now();
        if (dashboardCache && (now - dashboardCache.timestamp) < CACHE_TTL) {
            return res.json({
                success: true,
                cached: true,
                data: dashboardCache.data
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Parallel queries for better performance
        const [
            // Products
            totalProducts,
            activeProducts,
            outOfStock,

            // Orders
            totalOrders,
            todayOrders,
            pendingOrders,
            revenueData,
            todayRevenueData,

            // Reservations
            totalReservations,
            todayReservations,
            pendingReservations,

            // Customers
            totalCustomers,
            activeCustomers,

            // Messages
            totalMessages,
            unreadMessages,

            // Content
            totalBlogs,
            publishedBlogs,
            totalChefs,
            galleryItems,
        ] = await Promise.all([
            // Products
            Product.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({ stock: 0 }),

            // Orders
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Order.countDocuments({ status: 'pending' }),
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: today, $lt: tomorrow } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),

            // Reservations
            Reservation.countDocuments(),
            Reservation.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
            Reservation.countDocuments({ status: 'pending' }),

            // Customers
            Customer.countDocuments(),
            Customer.countDocuments({ isActive: true }),

            // Messages
            Message.countDocuments(),
            Message.countDocuments({ status: 'unread' }),

            // Content
            Blog.countDocuments(),
            Blog.countDocuments({ status: 'published' }),
            Chef.countDocuments({ isActive: true }),
            Gallery.countDocuments({ isActive: true }),
        ]);

        // Calculate revenue
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].total : 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name email')
            .select('orderNumber totalAmount status createdAt');

        // Get recent reservations
        const recentReservations = await Reservation.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name phone')
            .select('name date time numberOfGuests status');

        // Get low stock products
        const lowStockProducts = await Product.find({ stock: { $lte: 10, $gt: 0 } })
            .sort({ stock: 1 })
            .limit(5)
            .select('name stock category');

        // Sales trend (last 7 days)
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        const salesTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Order status breakdown
        const orderStatusBreakdown = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const responseData = {
            overview: {
                products: {
                    total: totalProducts,
                    active: activeProducts,
                    outOfStock: outOfStock
                },
                orders: {
                    total: totalOrders,
                    today: todayOrders,
                    pending: pendingOrders
                },
                revenue: {
                    total: totalRevenue,
                    today: todayRevenue
                },
                reservations: {
                    total: totalReservations,
                    today: todayReservations,
                    pending: pendingReservations
                },
                customers: {
                    total: totalCustomers,
                    active: activeCustomers
                },
                messages: {
                    total: totalMessages,
                    unread: unreadMessages
                },
                content: {
                    blogs: totalBlogs,
                    published: publishedBlogs,
                    chefs: totalChefs,
                    gallery: galleryItems
                }
            },
            recentActivity: {
                orders: recentOrders,
                reservations: recentReservations
            },
            alerts: {
                lowStockProducts: lowStockProducts,
                pendingOrders: pendingOrders,
                unreadMessages: unreadMessages,
                pendingReservations: pendingReservations
            },
            charts: {
                salesTrend: salesTrend,
                orderStatus: orderStatusBreakdown
            }
        };

        // Update cache
        dashboardCache!.data = responseData;
        dashboardCache!.timestamp = now;

        res.json({
            success: true,
            cached: false,
            data: responseData
        });
    } catch (error: any) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
});

// @route   Post /api/dashboard/clear-cache
// @desc    Clear Dashboard Cache (for testing or after major updates)
// @access  Private (Admin only)
router.post('/clear-cache', protect, async (req: AuthRequest, res: Response) => {
    try {
        if (dashboardCache) {
            dashboardCache.data = null;
            dashboardCache.timestamp = 0;
        }

        res.json({
            success: true,
            message: 'Dashboard cache cleared successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;