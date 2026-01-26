import express, { Request, Response } from 'express';
import Partner from '../models/Partner';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validatePartnerCreate,
    validatePartnerUpdate,
    validateIdParam
} from '../middleware/validation';

const router = express.Router();

// @route   GET /api/partners
// @desc    Get all partners
// @access  Public
router.get('/', async (req: Request, res: Response) => {
    try {
        const { isActive } = req.query;

        let query: any = {};

        if (isActive !== undefined) {
            if (isActive !== 'true' && isActive !== 'false') {
                return res.status(400).json({
                    success: false,
                    message: 'isActive must be either "true" or "false"'
                });
            }
            query.isActive = isActive === 'true';
        }

        const partners = await Partner.find(query)
            .sort({ displayOrder: 1, createdAt: -1 })
            .populate('createdBy', 'name email');

        res.json({
            success: true,
            count: partners.length,
            data: partners,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/partners/:id
// @desc    Get single partner by ID
// @access  Public
router.get('/:id', validateIdParam, async (req: Request, res: Response) => {
    try {
        const partner = await Partner.findById(req.params.id).populate(
            'createdBy',
            'name email'
        );

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }

        res.json({
            success: true,
            data: partner,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   POST /api/partners
// @desc    Create partner (Admin only)
// @access  Private
router.post('/', protect, validatePartnerCreate, async (req: AuthRequest, res: Response) => {
    try {
        const partnerData = {
            ...req.body,
            createdBy: req.user?.id,
        };

        const partner = await Partner.create(partnerData);

        res.status(201).json({
            success: true,
            message: 'Partner created successfully',
            data: partner,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PUT /api/partners/:id
// @desc    Update partner (Admin only)
// @access  Private
router.put('/:id', protect, validateIdParam, validatePartnerUpdate, async (req: AuthRequest, res: Response) => {
    try {
        const partner = await Partner.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }

        res.json({
            success: true,
            message: 'Partner updated successfully',
            data: partner,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/partners/:id
// @desc    Delete partner (Admin only)
// @access  Private
router.delete('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const partner = await Partner.findByIdAndDelete(req.params.id);

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found',
            });
        }

        res.json({
            success: true,
            message: 'Partner deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;