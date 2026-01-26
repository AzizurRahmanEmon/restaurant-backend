// ============================================
// BLOG VALIDATORS
// src/middleware/validation/blog.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { sanitizeInput } from './common';

export const validateBlogCreate = (req: Request, res: Response, next: NextFunction) => {
    const { title, content, excerpt, category } = req.body;
    const errors: string[] = [];

    if (!title || title.trim().length < 5) {
        errors.push('Title must be at least 5 characters');
    }

    if (!content || content.trim().length < 50) {
        errors.push('Content must be at least 50 characters');
    }

    if (!excerpt || excerpt.trim().length < 10) {
        errors.push('Excerpt must be at least 10 characters');
    }

    if (!category || category.trim().length === 0) {
        errors.push('Category is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body.title = sanitizeInput(title);
    req.body.excerpt = sanitizeInput(excerpt);
    req.body.category = sanitizeInput(category);

    next();
};

export const validateBlogUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { title, content, excerpt, category, status, tags, isPublished } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'slug', 'author', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (title !== undefined) {
        if (title.trim().length < 5) {
            errors.push('Title must be at least 5 characters');
        }
        if (title.length > 200) {
            errors.push('Title is too long. Maximum 200 characters allowed');
        }
        req.body.title = sanitizeInput(title);
    }

    if (content !== undefined) {
        if (content.trim().length < 50) {
            errors.push('Content must be at least 50 characters');
        }
        if (content.length > 50000) {
            errors.push('Content is too long. Maximum 50,000 characters allowed');
        }
    }

    if (excerpt !== undefined) {
        if (excerpt.trim().length < 10) {
            errors.push('Excerpt must be at least 10 characters');
        }
        if (excerpt.length > 500) {
            errors.push('Excerpt is too long. Maximum 500 characters allowed');
        }
        req.body.excerpt = sanitizeInput(excerpt);
    }

    if (category !== undefined) {
        if (category.trim().length === 0) {
            errors.push('Category is required');
        }
        req.body.category = sanitizeInput(category);
    }

    if (status !== undefined) {
        const validStatuses = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(status)) {
            errors.push('Status must be one of: draft, published, archived');
        }
    }

    if (tags !== undefined && Array.isArray(tags)) {
        if (tags.length > 10) {
            errors.push('Maximum 10 tags allowed');
        }
        req.body.tags = tags.map(tag => sanitizeInput(tag));
    }

    if (isPublished !== undefined && typeof isPublished !== 'boolean') {
        errors.push('isPublished must be a boolean value');
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