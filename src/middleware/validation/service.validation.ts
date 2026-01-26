// ============================================
// SERVICE VALIDATORS
// src/middleware/validation/service.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from './common';

export const validateServiceCreate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, description, img } = req.body;
    const errors: string[] = [];

    if (!title || title.trim().length < 2) {
        errors.push('Service title must be at least 2 characters');
    }

    if (title && title.length > 100) {
        errors.push('Service title is too long (max 100 characters)');
    }

    if (!description || description.trim().length < 10) {
        errors.push('Service description must be at least 10 characters');
    }

    if (description && description.length > 500) {
        errors.push('Service description is too long (max 500 characters)');
    }

    if (!img || img.trim().length < 1) {
        errors.push('Service image/icon is required');
    }

    if (img && img.length > 500) {
        errors.push('Image/icon value is too long (max 500 characters)');
    }

    // If it looks like a URL, validate URL format; otherwise allow emojis/text
    if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
        if (!/^https?:\/\/.+\..+/i.test(img)) {
            errors.push('Invalid image URL format');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body.title = sanitizeInput(title);
    req.body.description = sanitizeInput(description);

    next();
};

export const validateServiceUpdate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, description, img, displayOrder, isActive } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'createdBy', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (title !== undefined) {
        if (title.trim().length < 2) {
            errors.push('Service title must be at least 2 characters');
        }
        if (title.length > 100) {
            errors.push('Service title is too long (max 100 characters)');
        }
        req.body.title = sanitizeInput(title);
    }

    if (description !== undefined) {
        if (description.trim().length < 10) {
            errors.push('Service description must be at least 10 characters');
        }
        if (description.length > 500) {
            errors.push('Service description is too long (max 500 characters)');
        }
        req.body.description = sanitizeInput(description);
    }

    if (img !== undefined) {
        if (img.trim().length < 1) {
            errors.push('Service image/icon is required');
        }
        if (img.length > 500) {
            errors.push('Image/icon value is too long (max 500 characters)');
        }
        // If it looks like a URL, validate URL format; otherwise allow emojis/text
        if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
            if (!/^https?:\/\/.+\..+/i.test(img)) {
                errors.push('Invalid image URL format');
            }
        }
    }

    if (displayOrder !== undefined) {
        if (!Number.isInteger(Number(displayOrder)) || Number(displayOrder) < 0) {
            errors.push('Display order must be a non-negative integer');
        }
        if (Number(displayOrder) > 9999) {
            errors.push('Display order is too large (max 9999)');
        }
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        errors.push('isActive must be a boolean value');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

export const validateServiceFilters = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { isActive } = req.query;

    if (isActive !== undefined) {
        if (isActive !== 'true' && isActive !== 'false') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be either "true" or "false"'
            });
        }
    }

    next();
};