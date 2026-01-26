// ============================================
// GALLERY VALIDATORS
// src/middleware/validation/gallery.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from './common';

export const validateGalleryCreate = (req: Request, res: Response, next: NextFunction) => {
    const { title, img, category, desc, width, height, span } = req.body;
    const errors: string[] = [];

    if (!title || title.trim().length < 2) {
        errors.push('Title must be at least 2 characters');
    }

    if (title && title.length > 200) {
        errors.push('Title is too long (max 200 characters)');
    }

    if (!img || img.trim().length < 5) {
        errors.push('Image URL is required');
    }

    if (img && img.length > 500) {
        errors.push('Image URL is too long (max 500 characters)');
    }

    if (img && !/^https?:\/\/.+\..+/i.test(img)) {
        errors.push('Invalid image URL format');
    }

    if (!category || category.trim().length < 2) {
        errors.push('Category is required');
    }

    if (category && category.length > 50) {
        errors.push('Category is too long (max 50 characters)');
    }

    if (!desc || desc.trim().length < 2) {
        errors.push('Description is required');
    }

    if (desc && desc.length > 500) {
        errors.push('Description is too long (max 500 characters)');
    }

    if (!width || typeof width !== 'number' || width < 1) {
        errors.push('Valid width is required (must be positive number)');
    }

    if (!height || typeof height !== 'number' || height < 1) {
        errors.push('Valid height is required (must be positive number)');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body.title = sanitizeInput(title);
    req.body.category = sanitizeInput(category);
    req.body.desc = sanitizeInput(desc);
    if (span) req.body.span = sanitizeInput(span);

    next();
};

export const validateGalleryUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { title, img, category, desc, width, height, span, displayOrder, isActive } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'createdBy', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (title !== undefined) {
        if (title.trim().length < 2) {
            errors.push('Title must be at least 2 characters');
        }
        if (title.length > 200) {
            errors.push('Title is too long (max 200 characters)');
        }
        req.body.title = sanitizeInput(title);
    }

    if (img !== undefined) {
        if (img.trim().length < 5) {
            errors.push('Image URL is required');
        }
        if (img.length > 500) {
            errors.push('Image URL is too long (max 500 characters)');
        }
        if (!/^https?:\/\/.+\..+/i.test(img)) {
            errors.push('Invalid image URL format');
        }
    }

    if (category !== undefined) {
        if (category.trim().length < 2) {
            errors.push('Category must be at least 2 characters');
        }
        if (category.length > 50) {
            errors.push('Category is too long (max 50 characters)');
        }
        req.body.category = sanitizeInput(category);
    }

    if (desc !== undefined) {
        if (desc.trim().length < 2) {
            errors.push('Description must be at least 2 characters');
        }
        if (desc.length > 500) {
            errors.push('Description is too long (max 500 characters)');
        }
        req.body.desc = sanitizeInput(desc);
    }

    if (width !== undefined) {
        if (typeof width !== 'number' || width < 1) {
            errors.push('Width must be a positive number');
        }
    }

    if (height !== undefined) {
        if (typeof height !== 'number' || height < 1) {
            errors.push('Height must be a positive number');
        }
    }

    if (span !== undefined) {
        req.body.span = sanitizeInput(span);
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