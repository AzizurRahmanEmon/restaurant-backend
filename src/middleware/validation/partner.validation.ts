// ============================================
// PARTNER VALIDATORS
// src/middleware/validation/partner.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from './common';

export const validatePartnerCreate = (req: Request, res: Response, next: NextFunction) => {
    const { icon, width, height, name } = req.body;
    const errors: string[] = [];

    if (!icon || icon.trim().length < 5) {
        errors.push('Partner icon URL is required');
    }

    if (icon && icon.length > 500) {
        errors.push('Icon URL is too long (max 500 characters)');
    }

    if (icon && !/^https?:\/\/.+\..+/i.test(icon)) {
        errors.push('Invalid icon URL format');
    }

    if (!width || typeof width !== 'number' || width < 1) {
        errors.push('Valid width is required (must be positive number)');
    }

    if (!height || typeof height !== 'number' || height < 1) {
        errors.push('Valid height is required (must be positive number)');
    }

    if (name && name.length > 100) {
        errors.push('Partner name is too long (max 100 characters)');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    if (name) req.body.name = sanitizeInput(name);

    next();
};

export const validatePartnerUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { icon, width, height, name, displayOrder, isActive } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'createdBy', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (icon !== undefined) {
        if (icon.trim().length < 5) {
            errors.push('Icon URL is required');
        }
        if (icon.length > 500) {
            errors.push('Icon URL is too long (max 500 characters)');
        }
        if (!/^https?:\/\/.+\..+/i.test(icon)) {
            errors.push('Invalid icon URL format');
        }
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

    if (name !== undefined) {
        if (name.length > 100) {
            errors.push('Partner name is too long (max 100 characters)');
        }
        req.body.name = sanitizeInput(name);
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