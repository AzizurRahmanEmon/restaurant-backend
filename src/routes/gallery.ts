import express, { Request, Response } from 'express';
import Gallery from '../models/Gallery';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validateGalleryCreate,
    validateGalleryUpdate,
    validateIdParam,
    validateSortParam
} from '../middleware/validation';

const router = express.Router();

// @route   GET /api/gallery
// @desc    Get all gallery items with filters
// @access  Public
router.get('/', validateSortParam, async (req: Request, res: Response) => {
    try {
        const { category, isActive, sort } = req.query;

        let query: any = {};

        // Filter by category (validate if provided)
        if (category) {
            const categoryStr = category as string;
            if (categoryStr.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Category parameter too long'
                });
            }
            query.category = categoryStr;
        }

        // Filter by active status
        if (isActive !== undefined) {
            if (isActive !== 'true' && isActive !== 'false') {
                return res.status(400).json({
                    success: false,
                    message: 'isActive must be either "true" or "false"'
                });
            }
            query.isActive = isActive === 'true';
        }

        // Sorting (already validated by validateSortParam)
        let sortOption: any = { displayOrder: 1, createdAt: -1 };
        if (sort === 'title') sortOption = { title: 1 };
        if (sort === 'title-desc') sortOption = { title: -1 };
        if (sort === 'category') sortOption = { category: 1 };
        if (sort === 'newest') sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const galleryItems = await Gallery.find(query)
            .sort(sortOption)
            .populate('createdBy', 'name email');

        res.json({
            success: true,
            count: galleryItems.length,
            data: galleryItems,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery item by ID
// @access  Public
router.get('/:id', validateIdParam, async (req: Request, res: Response) => {
    try {
        const galleryItem = await Gallery.findById(req.params.id).populate(
            'createdBy',
            'name email'
        );

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found',
            });
        }

        res.json({
            success: true,
            data: galleryItem,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   POST /api/gallery
// @desc    Create gallery item (Admin only)
// @access  Private
router.post('/', protect, validateGalleryCreate, async (req: AuthRequest, res: Response) => {
    try {
        const galleryData = {
            ...req.body,
            createdBy: req.user?.id,
        };

        const galleryItem = await Gallery.create(galleryData);

        res.status(201).json({
            success: true,
            message: 'Gallery item created successfully',
            data: galleryItem,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery item (Admin only)
// @access  Private
router.put('/:id', protect, validateIdParam, validateGalleryUpdate, async (req: AuthRequest, res: Response) => {
    try {
        const galleryItem = await Gallery.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found',
            });
        }

        res.json({
            success: true,
            message: 'Gallery item updated successfully',
            data: galleryItem,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item (Admin only)
// @access  Private
router.delete('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const galleryItem = await Gallery.findByIdAndDelete(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found',
            });
        }

        res.json({
            success: true,
            message: 'Gallery item deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;