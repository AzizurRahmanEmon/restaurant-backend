import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Chef from '../models/Chef';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validateChefCreate,
    validateChefUpdate,
    validateDisplayOrder,
    validateSocialLinks,
    validateIdParam,
    validatePagination,
    validateSearchQuery,
    validateParamSafety
} from '../middleware/validation';

const router = express.Router();

// @route   GET /api/chefs
// @desc    Get all chefs with filters
// @access  Public
router.get('/', validatePagination, validateSearchQuery, async (req: Request, res: Response) => {
    try {
        const {
            isActive,
            specialty,
            search,
            sort,
            page = 1,
            limit = 10,
        } = req.query;

        let query: any = {};

        // Filter by active status
        if (isActive !== undefined) query.isActive = isActive === 'true';

        // Filter by specialty
        if (specialty) query.specialty = { $regex: specialty, $options: 'i' };

        // Search by name, title, or specialty
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { specialty: { $regex: search, $options: 'i' } },
            ];
        }

        // Sorting
        let sortOption: any = { displayOrder: 1, createdAt: -1 };
        if (sort === 'name-asc') sortOption = { name: 1 };
        if (sort === 'name-desc') sortOption = { name: -1 };
        if (sort === 'order-asc') sortOption = { displayOrder: 1 };
        if (sort === 'order-desc') sortOption = { displayOrder: -1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const chefs = await Chef.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .populate('createdBy', 'name email');

        const total = await Chef.countDocuments(query);

        res.json({
            success: true,
            count: chefs.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: chefs,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/chefs/active
// @desc    Get all active chefs (for frontend display)
// @access  Public
router.get('/active', async (req: Request, res: Response) => {
    try {
        const chefs = await Chef.find({ isActive: true }).sort({ displayOrder: 1 });

        res.json({
            success: true,
            count: chefs.length,
            data: chefs,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/chefs/stats
// @desc    Get chef statistics
// @access  Private
router.get('/stats', protect, async (req: AuthRequest, res: Response) => {
    try {
        const totalChefs = await Chef.countDocuments();
        const activeChefs = await Chef.countDocuments({ isActive: true });
        const inactiveChefs = await Chef.countDocuments({ isActive: false });

        // Count by specialty
        const specialtyCounts = await Chef.aggregate([
            { $group: { _id: '$specialty', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({
            success: true,
            data: {
                total: totalChefs,
                active: activeChefs,
                inactive: inactiveChefs,
                bySpecialty: specialtyCounts,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/chefs/:profileLink
// @desc    Get single chef by profile link
// @access  Public
router.get('/:profileLink', validateParamSafety('profileLink'), async (req: Request, res: Response) => {
    try {
        const chef = await Chef.findOne({ profileLink: req.params.profileLink })
            .populate('createdBy', 'name email');

        if (!chef) {
            return res.status(404).json({
                success: false,
                message: 'Chef not found',
            });
        }

        res.json({
            success: true,
            data: chef,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   POST /api/chefs
// @desc    Create chef (Admin only)
// @access  Private
router.post('/', protect, validateChefCreate, async (req: AuthRequest, res: Response) => {
    try {
        // Convert string id to ObjectId
        const createdById = new mongoose.Types.ObjectId(req.user?.id);

        const chefData = {
            ...req.body,
            createdBy: createdById,
        };

        const chef = await Chef.create(chefData);

        res.status(201).json({
            success: true,
            message: 'Chef created successfully',
            data: chef,
        });
    } catch (error: any) {
        // Handle duplicate profileLink error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Profile link already exists',
            });
        }

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PUT /api/chefs/:id
// @desc    Update chef (Admin only)
// @access  Private
router.put('/:id', protect, validateIdParam, validateChefUpdate, async (req: AuthRequest, res: Response) => {
    try {
        const chef = await Chef.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!chef) {
            return res.status(404).json({
                success: false,
                message: 'Chef not found',
            });
        }

        res.json({
            success: true,
            message: 'Chef updated successfully',
            data: chef,
        });
    } catch (error: any) {
        // Handle duplicate profileLink error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Profile link already exists',
            });
        }

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/chefs/:id/toggle-active
// @desc    Toggle chef active status
// @access  Private
router.patch('/:id/toggle-active', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const chef = await Chef.findById(req.params.id);

        if (!chef) {
            return res.status(404).json({
                success: false,
                message: 'Chef not found',
            });
        }

        chef.isActive = !chef.isActive;
        await chef.save();

        res.json({
            success: true,
            message: `Chef is now ${chef.isActive ? 'active' : 'inactive'}`,
            data: chef,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/chefs/:id/display-order
// @desc    Update chef display order
// @access  Private
router.patch('/:id/display-order', protect, validateIdParam, validateDisplayOrder, async (req: AuthRequest, res: Response) => {
    try {
        const { displayOrder } = req.body;

        const chef = await Chef.findByIdAndUpdate(
            req.params.id,
            { displayOrder },
            { new: true, runValidators: true }
        );

        if (!chef) {
            return res.status(404).json({
                success: false,
                message: 'Chef not found',
            });
        }

        res.json({
            success: true,
            message: 'Display order updated successfully',
            data: chef,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/chefs/:id/social-links
// @desc    Update chef social links
// @access  Private
router.patch('/:id/social-links', protect, validateIdParam, validateSocialLinks, async (req: AuthRequest, res: Response) => {
    try {
        const { linkedin, facebook, twitter } = req.body;

        const chef = await Chef.findById(req.params.id);

        if (!chef) {
            return res.status(404).json({
                success: false,
                message: 'Chef not found',
            });
        }

        // Update social links
        if (linkedin !== undefined) chef.socialLinks.linkedin = linkedin;
        if (facebook !== undefined) chef.socialLinks.facebook = facebook;
        if (twitter !== undefined) chef.socialLinks.twitter = twitter;

        await chef.save();

        res.json({
            success: true,
            message: 'Social links updated successfully',
            data: chef,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/chefs/:id
// @desc    Delete chef (soft delete - set inactive)
// @access  Private
router.delete('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const chef = await Chef.findById(req.params.id);

        if (!chef) {
            return res.status(404).json({
                success: false,
                message: 'Chef not found',
            });
        }

        // Soft delete - set as inactive
        chef.isActive = false;
        await chef.save();

        res.json({
            success: true,
            message: 'Chef deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/chefs/:id/permanent
// @desc    Permanently delete chef (Admin only)
// @access  Private
router.delete('/:id/permanent', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const chef = await Chef.findByIdAndDelete(req.params.id);

        if (!chef) {
            return res.status(404).json({
                success: false,
                message: 'Chef not found',
            });
        }

        res.json({
            success: true,
            message: 'Chef permanently deleted',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;