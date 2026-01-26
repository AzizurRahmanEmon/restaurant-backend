import express, { Request, Response } from 'express';
import Service from '../models/Service';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validateServiceCreate,
    validateServiceUpdate,
    validateServiceFilters,
    validateIdParam
} from '../middleware/validation';

const router = express.Router();

// @route   GET /api/services
// @desc    Get all services
// @access  Public
router.get('/', validateServiceFilters, async (req: Request, res: Response) => {
    try {
        const { isActive } = req.query;

        let query: any = {};

        // Filter by active status (already validated)
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const services = await Service.find(query)
            .sort({ displayOrder: 1, createdAt: -1 })
            .populate('createdBy', 'name email');

        res.json({
            success: true,
            count: services.length,
            data: services,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   GET /api/services/:id
// @desc    Get single service by ID
// @access  Public
router.get('/:id', validateIdParam, async (req: Request, res: Response) => {
    try {
        const service = await Service.findById(req.params.id).populate(
            'createdBy',
            'name email'
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        res.json({
            success: true,
            data: service,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   POST /api/services
// @desc    Create service (Admin only)
// @access  Private
router.post('/', protect, validateServiceCreate, async (req: AuthRequest, res: Response) => {
    try {
        const serviceData = {
            ...req.body,
            createdBy: req.user?.id,
        };

        const service = await Service.create(serviceData);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PUT /api/services/:id
// @desc    Update service (Admin only)
// @access  Private
router.put('/:id', protect, validateIdParam, validateServiceUpdate, async (req: AuthRequest, res: Response) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        res.json({
            success: true,
            message: 'Service updated successfully',
            data: service,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (Admin only)
// @access  Private
router.delete('/:id', protect, validateIdParam, async (req: AuthRequest, res: Response) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        res.json({
            success: true,
            message: 'Service deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;