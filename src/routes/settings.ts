import express, { Response } from 'express';
import Settings from '../models/Settings';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validateRestaurantInfo,
    validateBusinessHours,
    validateNotifications,
    validateSocialMedia,
    validateGeneralSettings,
    validateSettingsUpdate
} from '../middleware/validation';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get restaurant settings
// @access  Public (basic info) / Private (full info)
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        let settings = await Settings.findOne().populate('updatedBy', 'name email');

        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({
                restaurantName: 'Zestify Restaurant',
                email: 'info@zestify.com',
                phone: '+1 234 567 8900',
                address: '123 Main Street, City, State 12345',
                updatedBy: req.user?.id,
            });
        }

        // If not authenticated, return only public information
        if (!req.user) {
            return res.json({
                success: true,
                data: {
                    restaurantName: settings.restaurantName,
                    email: settings.email,
                    phone: settings.phone,
                    address: settings.address,
                    description: settings.description,
                    logo: settings.logo,
                    businessHours: settings.businessHours,
                    socialMedia: settings.socialMedia,
                    allowOnlineOrdering: settings.allowOnlineOrdering,
                    allowReservations: settings.allowReservations,
                },
            });
        }

        // Return full settings for authenticated users
        res.json({
            success: true,
            data: settings,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PUT /api/settings
// @desc    Update restaurant settings (Admin only)
// @access  Private
router.put('/', protect, validateSettingsUpdate, async (req: AuthRequest, res: Response) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            // Create new settings if doesn't exist
            const newSettings = new Settings({
                ...req.body,
                updatedBy: req.user?.id,
            });
            settings = await newSettings.save();
        } else {
            // Update existing settings
            Object.assign(settings, req.body);
            settings.updatedBy = req.user?.id as any;
            await settings.save();
        }

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/settings/restaurant-info
// @desc    Update restaurant information
// @access  Private
router.patch('/restaurant-info', protect, validateRestaurantInfo, async (req: AuthRequest, res: Response) => {
    try {
        const { restaurantName, email, phone, address, description, logo } = req.body;

        const settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found. Please initialize settings first.',
            });
        }

        // Update only provided fields (already sanitized by middleware)
        if (restaurantName) settings.restaurantName = restaurantName;
        if (email) settings.email = email;
        if (phone) settings.phone = phone;
        if (address) settings.address = address;
        if (description !== undefined) settings.description = description;
        if (logo !== undefined) settings.logo = logo;
        settings.updatedBy = req.user?.id as any;

        await settings.save();

        res.json({
            success: true,
            message: 'Restaurant information updated successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/settings/business-hours
// @desc    Update business hours
// @access  Private
router.patch('/business-hours', protect, validateBusinessHours, async (req: AuthRequest, res: Response) => {
    try {
        const { businessHours } = req.body;

        const settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found. Please initialize settings first.',
            });
        }

        settings.businessHours = businessHours;
        settings.updatedBy = req.user?.id as any;
        await settings.save();

        res.json({
            success: true,
            message: 'Business hours updated successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/settings/notifications
// @desc    Update notification preferences
// @access  Private
router.patch('/notifications', protect, validateNotifications, async (req: AuthRequest, res: Response) => {
    try {
        const { notifications } = req.body;

        const settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found. Please initialize settings first.',
            });
        }

        settings.notifications = {
            ...settings.notifications,
            ...notifications,
        };
        settings.updatedBy = req.user?.id as any;
        await settings.save();

        res.json({
            success: true,
            message: 'Notification preferences updated successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/settings/social-media
// @desc    Update social media links
// @access  Private
router.patch('/social-media', protect, validateSocialMedia, async (req: AuthRequest, res: Response) => {
    try {
        const { socialMedia } = req.body;

        const settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found. Please initialize settings first.',
            });
        }

        settings.socialMedia = {
            ...settings.socialMedia,
            ...socialMedia,
        };
        settings.updatedBy = req.user?.id as any;
        await settings.save();

        res.json({
            success: true,
            message: 'Social media links updated successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/settings/general
// @desc    Update general settings (currency, tax, delivery, etc.)
// @access  Private
router.patch('/general', protect, validateGeneralSettings, async (req: AuthRequest, res: Response) => {
    try {
        const {
            currency,
            timezone,
            taxRate,
            deliveryFee,
            minimumOrderAmount,
            allowOnlineOrdering,
            allowReservations,
        } = req.body;

        const settings = await Settings.findOne();

        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'Settings not found. Please initialize settings first.',
            });
        }

        // Update only provided fields (already validated by middleware)
        if (currency) settings.currency = currency;
        if (timezone) settings.timezone = timezone;
        if (taxRate !== undefined) settings.taxRate = taxRate;
        if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
        if (minimumOrderAmount !== undefined) settings.minimumOrderAmount = minimumOrderAmount;
        if (allowOnlineOrdering !== undefined) settings.allowOnlineOrdering = allowOnlineOrdering;
        if (allowReservations !== undefined) settings.allowReservations = allowReservations;
        settings.updatedBy = req.user?.id as any;

        await settings.save();

        res.json({
            success: true,
            message: 'General settings updated successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   POST /api/settings/reset
// @desc    Reset settings to default (Admin only)
// @access  Private
router.post('/reset', protect, async (req: AuthRequest, res: Response) => {
    try {
        // Delete all existing settings
        await Settings.deleteMany({});

        // Create fresh default settings
        const settings = await Settings.create({
            restaurantName: 'Zestify Restaurant',
            email: 'info@zestify.com',
            phone: '+1 234 567 8900',
            address: '123 Main Street, City, State 12345',
            updatedBy: req.user?.id,
        });

        res.json({
            success: true,
            message: 'Settings reset to default successfully',
            data: settings,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;