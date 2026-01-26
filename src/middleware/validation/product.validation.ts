// ============================================
// PRODUCT VALIDATORS
// src/middleware/validation/product.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { sanitizeInput, validatePrice } from './common';

export const validateProductCreate = (req: Request, res: Response, next: NextFunction) => {
    const { name, description, price, category, stock } = req.body;
    const errors: string[] = [];

    if (!name || name.trim().length < 3) {
        errors.push('Product name must be at least 3 characters');
    }

    if (!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters');
    }

    if (!validatePrice(price)) {
        errors.push('Price must be a valid positive number');
    }

    if (!category || category.trim().length === 0) {
        errors.push('Category is required');
    }

    if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
        errors.push('Stock must be a non-negative integer');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body.name = sanitizeInput(name);
    req.body.description = sanitizeInput(description);
    req.body.category = sanitizeInput(category);

    next();
};

export const validateProductUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { name, description, price, category, stock } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'slug', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (name !== undefined) {
        if (name.trim().length < 3) {
            errors.push('Product name must be at least 3 characters');
        }
        req.body.name = sanitizeInput(name);
    }

    if (description !== undefined) {
        if (description.trim().length < 10) {
            errors.push('Description must be at least 10 characters');
        }
        req.body.description = sanitizeInput(description);
    }

    if (price !== undefined && !validatePrice(price)) {
        errors.push('Price must be a valid positive number');
    }

    if (category !== undefined) {
        if (category.trim().length === 0) {
            errors.push('Category is required');
        }
        req.body.category = sanitizeInput(category);
    }

    if (stock !== undefined) {
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            errors.push('Stock must be a non-negative integer');
        }
        if (Number(stock) > 100000) {
            errors.push('Stock value seems unrealistic. Maximum allowed is 100,000');
        }
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

export const validateStockUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { stock } = req.body;

    if (stock === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Stock quantity is required'
        });
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({
            success: false,
            message: 'Stock must be a non-negative integer'
        });
    }

    if (Number(stock) > 100000) {
        return res.status(400).json({
            success: false,
            message: 'Stock value seems unrealistic. Maximum allowed is 100,000'
        });
    }

    next();
};

export const validatePriceRange = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { minPrice, maxPrice } = req.query;

    if (minPrice) {
        const min = Number(minPrice);
        if (isNaN(min) || min < 0) {
            return res.status(400).json({
                success: false,
                message: 'Minimum price must be a non-negative number'
            });
        }
        if (min > 1000000) {
            return res.status(400).json({
                success: false,
                message: 'Minimum price is too large'
            });
        }
    }

    if (maxPrice) {
        const max = Number(maxPrice);
        if (isNaN(max) || max < 0) {
            return res.status(400).json({
                success: false,
                message: 'Maximum price must be a non-negative number'
            });
        }
        if (max > 1000000) {
            return res.status(400).json({
                success: false,
                message: 'Maximum price is too large'
            });
        }
    }

    if (minPrice && maxPrice) {
        const min = Number(minPrice);
        const max = Number(maxPrice);
        if (min > max) {
            return res.status(400).json({
                success: false,
                message: 'Minimum price cannot be greater than maximum price'
            });
        }
    }

    next();
};

export const validateTagsQuery = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { tags } = req.query;

    if (tags) {
        const tagsStr = tags as string;

        if (tagsStr.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'Tags query is too long'
            });
        }

        const tagArray = tagsStr.split(',');
        if (tagArray.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'Too many tags (max 20)'
            });
        }

        const sanitizedTags = tagArray.map(tag => sanitizeInput(tag.trim()));
        req.query.tags = sanitizedTags.join(',');
    }

    next();
};