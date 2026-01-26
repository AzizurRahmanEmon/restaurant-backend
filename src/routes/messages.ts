import express, { Request, Response } from 'express';
import Message from '../models/Message';
import { protect } from '../middleware/auth';
import { AuthRequest } from '../types';
import {
    validateMessageCreate,
    validateMessageUpdate,
    validateMessageStatus,
    validateMessageReply,
    validateBulkDelete,
    validateIdParam,
    validatePagination,
    validateSearchQuery,
    validateSortParam,
    validateStatusFilter
} from '../middleware/validation';

const router = express.Router();

// @route GET /api/messages
// @desc Get all messages with filters (Admin only)
// @access Private
router.get('/', protect, validatePagination, validateSearchQuery, validateSortParam, validateStatusFilter, async (req: Request, res: Response) => {
    try {
        const { status, isImportant, search, sort, page = 1, limit = 20 } = req.query;

        let query: any = {};

        // Filter by status (already validated by validateStatusFilter)
        if (status) {
            query.status = status;
        }

        // Filter by important
        if (isImportant !== undefined) {
            if (isImportant !== 'true' && isImportant !== 'false') {
                return res.status(400).json({
                    success: false,
                    message: 'isImportant must be either "true" or "false"'
                });
            }
            query.isImportant = isImportant === 'true';
        }

        // Search by name, email, or subject (already sanitized by validateSearchQuery)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
            ];
        }

        // Sorting (already validated by validateSortParam)
        let sortOption: any = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'name') sortOption = { name: 1 };
        if (sort === 'status') sortOption = { status: 1, createdAt: -1 };

        // Pagination (already validated by validatePagination)
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const messages = await Message.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .populate('repliedBy', 'name email');

        const total = await Message.countDocuments(query);

        res.json({
            success: true,
            count: messages.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: messages,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route GET /api/messages/stats
// @desc Get message statistics (Admin only)
// @access Private
router.get('/stats', protect, async (_req: Request, res: Response) => {
    try {
        const total = await Message.countDocuments();
        const unread = await Message.countDocuments({ status: 'unread' });
        const read = await Message.countDocuments({ status: 'read' });
        const replied = await Message.countDocuments({ status: 'replied' });
        const archived = await Message.countDocuments({ status: 'archived' });
        const important = await Message.countDocuments({ isImportant: true });

        res.json({
            success: true,
            data: {
                total,
                unread,
                read,
                replied,
                archived,
                important,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route POST /api/messages/bulk/delete
// @desc Delete multiple messages (Admin only)
// @access Private
// Note: This route must come BEFORE /:id to avoid route conflict
router.post('/bulk/delete', protect, validateBulkDelete, async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;

        const result = await Message.deleteMany({ _id: { $in: ids } });

        res.json({
            success: true,
            message: `${result.deletedCount} message(s) deleted successfully`,
            deletedCount: result.deletedCount,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route GET /api/messages/:id
// @desc Get single message by ID (Admin only)
// @access Private
router.get('/:id', protect, validateIdParam, async (req: Request, res: Response) => {
    try {
        const message = await Message.findById(req.params.id).populate(
            'repliedBy',
            'name email'
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        // Mark as read if it's unread
        if (message.status === 'unread') {
            message.status = 'read';
            await message.save();
        }

        res.json({
            success: true,
            data: message,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route POST /api/messages
// @desc Create new message (Contact form submission)
// @access Public
router.post('/', validateMessageCreate, async (req: Request, res: Response) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const newMessage = await Message.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully. We will get back to you soon!',
            data: newMessage,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route PUT /api/messages/:id
// @desc Update message (Admin only)
// @access Private
router.put('/:id', protect, validateIdParam, validateMessageUpdate, async (req: AuthRequest, res: Response) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        res.json({
            success: true,
            message: 'Message updated successfully',
            data: message,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/messages/:id/status
// @desc    Update message status (Admin only)
// @access  Private
router.patch('/:id/status', protect, validateIdParam, validateMessageStatus, async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: message,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   PATCH /api/messages/:id/important
// @desc    Toggle important flag (Admin only)
// @access  Private
router.patch('/:id/important', protect, validateIdParam, async (req: Request, res: Response) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        message.isImportant = !message.isImportant;
        await message.save();

        res.json({
            success: true,
            message: `Message marked as ${message.isImportant ? 'important' : 'not important'}`,
            data: message,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   POST /api/messages/:id/reply
// @desc    Reply to message (Admin only)
// @access  Private
router.post('/:id/reply', protect, validateIdParam, validateMessageReply, async (req: AuthRequest, res: Response) => {
    try {
        const { replyMessage } = req.body;

        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        message.status = 'replied';
        message.replyMessage = replyMessage;
        message.repliedAt = new Date();
        message.repliedBy = req.user?.email;

        await message.save();

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: message,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message (Admin only)
// @access  Private
router.delete('/:id', protect, validateIdParam, async (req: Request, res: Response) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;