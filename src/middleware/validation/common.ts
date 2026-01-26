// ============================================
// COMMON VALIDATORS - Shared across all routes
// src/middleware/validation/common.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const sanitizeInput = (input: string): string => {
    if (!input) return '';
    let sanitized = input.replace(/<[^>]*>/g, '');
    sanitized = validator.escape(sanitized);
    return sanitized.trim();
};

export const validateEmail = (email: string): boolean => {
    return validator.isEmail(email);
};

export const validatePhone = (phone: string): boolean => {
    return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export const validatePrice = (price: any): boolean => {
    const num = Number(price);
    return !isNaN(num) && num >= 0;
};

export const validateDate = (date: string): boolean => {
    return validator.isISO8601(date);
};

// ============================================
// COMMON VALIDATORS
// ============================================

export const validateIdParam = (req: Request, res: Response, next: NextFunction) => {
    const { id, customerId } = req.params;
    const idToValidate = id || customerId;

    if (!validateObjectId(idToValidate)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    next();
};

export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
    const { page, limit } = req.query;

    if (page) {
        const pageNum = parseInt(page as string);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > 10000) {
            return res.status(400).json({
                success: false,
                message: "Invalid page number",
            });
        }
    }

    if (limit) {
        const limitNum = parseInt(limit as string);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return res.status(400).json({
                success: false,
                message: "Limit must be between 1 and 100",
            });
        }
    }
    next();
};

export const validateSearchQuery = (req: Request, res: Response, next: NextFunction) => {
    const { search } = req.query;

    if (search) {
        const searchStr = search as string;
        if (searchStr.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Search query too long",
            });
        }
        // Create a new query object instead of modifying the read-only one
        const sanitized = sanitizeInput(searchStr);
        (req as any).sanitizedQuery = { ...req.query, search: sanitized };
    }
    next();
};

export const validateSortParam = (req: Request, res: Response, next: NextFunction) => {
    const { sort } = req.query;

    if (sort) {
        const validSortOptions = [
            "date-asc", "date-desc", "title", "title-desc", "views", "likes",
            "createdAt", "-createdAt", "name", "name-asc", "name-desc",
            "order-asc", "order-desc", "newest", "oldest", "category",
            "price", "-price", "price-asc", "price-desc", "rating", "status"
        ];

        if (!validSortOptions.includes(sort as string)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort option",
            });
        }
    }
    next();
};

export const validateStatusFilter = (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;

    if (status) {
        const validStatuses = [
            'draft', 'published', 'archived', 'pending', 'confirmed',
            'cancelled', 'completed', 'unread', 'read', 'replied'
        ];

        if (!validStatuses.includes(status as string)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status filter',
            });
        }
    }
    next();
};

export const validateParamSafety = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const value = req.params[paramName];

        if (!value) {
            return res.status(400).json({
                success: false,
                message: `${paramName} is required`,
            });
        }

        if (value.length > 200) {
            return res.status(400).json({
                success: false,
                message: `${paramName} is too long`,
            });
        }

        req.params[paramName] = sanitizeInput(value);
        next();
    };
};

export const validateDateRange = (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (startDate) {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid start date format'
            });
        }

        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        if (start < tenYearsAgo) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be more than 10 years ago'
            });
        }
    }

    if (endDate) {
        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid end date format'
            });
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (end > tomorrow) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be in the future'
            });
        }
    }

    if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date'
            });
        }

        const diffYears = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (diffYears > 2) {
            return res.status(400).json({
                success: false,
                message: 'Date range cannot exceed 2 years'
            });
        }
    }

    next();
};

// Deep sanitize object
export const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? sanitizeInput(obj) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized: any = {};
    // FIX: Use Object.prototype.hasOwnProperty.call instead
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
    }
    return sanitized;
};
