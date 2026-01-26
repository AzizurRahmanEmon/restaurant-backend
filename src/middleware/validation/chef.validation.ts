// ============================================
// CHEF VALIDATORS
// src/middleware/validation/chef.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { sanitizeInput } from './common';

export const validateChefCreate = (req: Request, res: Response, next: NextFunction) => {
    const { name, title, specialty, bio, profileLink } = req.body;
    const errors: string[] = [];

    if (!name || name.trim().length < 2) {
        errors.push('Chef name must be at least 2 characters');
    }

    if (name && name.length > 100) {
        errors.push('Chef name is too long (max 100 characters)');
    }

    if (!title || title.trim().length < 2) {
        errors.push('Title must be at least 2 characters');
    }

    if (title && title.length > 100) {
        errors.push('Title is too long (max 100 characters)');
    }

    if (!specialty || specialty.trim().length < 2) {
        errors.push('Specialty must be at least 2 characters');
    }

    if (specialty && specialty.length > 100) {
        errors.push('Specialty is too long (max 100 characters)');
    }

    if (bio && bio.length > 1000) {
        errors.push('Bio is too long (max 1000 characters)');
    }

    if (!profileLink || profileLink.trim().length < 3) {
        errors.push('Profile link must be at least 3 characters');
    }

    if (profileLink && !/^[a-zA-Z0-9-_]+$/.test(profileLink)) {
        errors.push('Profile link can only contain letters, numbers, hyphens, and underscores');
    }

    if (profileLink && profileLink.length > 100) {
        errors.push('Profile link is too long (max 100 characters)');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body.name = sanitizeInput(name);
    req.body.title = sanitizeInput(title);
    req.body.specialty = sanitizeInput(specialty);
    if (bio) req.body.bio = sanitizeInput(bio);
    req.body.profileLink = profileLink.trim().toLowerCase();

    next();
};

export const validateChefUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { name, title, specialty, bio, profileLink, displayOrder, isActive } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'createdBy', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (name !== undefined) {
        if (name.trim().length < 2) {
            errors.push('Chef name must be at least 2 characters');
        }
        if (name.length > 100) {
            errors.push('Chef name is too long (max 100 characters)');
        }
        req.body.name = sanitizeInput(name);
    }

    if (title !== undefined) {
        if (title.trim().length < 2) {
            errors.push('Title must be at least 2 characters');
        }
        if (title.length > 100) {
            errors.push('Title is too long (max 100 characters)');
        }
        req.body.title = sanitizeInput(title);
    }

    if (specialty !== undefined) {
        if (specialty.trim().length < 2) {
            errors.push('Specialty must be at least 2 characters');
        }
        if (specialty.length > 100) {
            errors.push('Specialty is too long (max 100 characters)');
        }
        req.body.specialty = sanitizeInput(specialty);
    }

    if (bio !== undefined) {
        if (bio.length > 1000) {
            errors.push('Bio is too long (max 1000 characters)');
        }
        req.body.bio = sanitizeInput(bio);
    }

    if (profileLink !== undefined) {
        if (profileLink.trim().length < 3) {
            errors.push('Profile link must be at least 3 characters');
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(profileLink)) {
            errors.push('Profile link can only contain letters, numbers, hyphens, and underscores');
        }
        if (profileLink.length > 100) {
            errors.push('Profile link is too long (max 100 characters)');
        }
        req.body.profileLink = profileLink.trim().toLowerCase();
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

export const validateDisplayOrder = (req: Request, res: Response, next: NextFunction) => {
    const { displayOrder } = req.body;

    if (displayOrder === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Display order is required'
        });
    }

    if (!Number.isInteger(Number(displayOrder)) || Number(displayOrder) < 0) {
        return res.status(400).json({
            success: false,
            message: 'Display order must be a non-negative integer'
        });
    }

    if (Number(displayOrder) > 9999) {
        return res.status(400).json({
            success: false,
            message: 'Display order is too large (max 9999)'
        });
    }

    next();
};

export const validateSocialLinks = (req: Request, res: Response, next: NextFunction) => {
    const { linkedin, facebook, twitter } = req.body;

    if (!linkedin && !facebook && !twitter) {
        return res.status(400).json({
            success: false,
            message: 'At least one social link must be provided'
        });
    }

    const errors: string[] = [];

    if (linkedin !== undefined && linkedin !== '') {
        if (linkedin.length > 200) {
            errors.push('LinkedIn URL is too long (max 200 characters)');
        }
        if (!validator.isURL(linkedin, { require_protocol: true })) {
            errors.push('Invalid LinkedIn URL format');
        }
    }

    if (facebook !== undefined && facebook !== '') {
        if (facebook.length > 200) {
            errors.push('Facebook URL is too long (max 200 characters)');
        }
        if (!validator.isURL(facebook, { require_protocol: true })) {
            errors.push('Invalid Facebook URL format');
        }
    }

    if (twitter !== undefined && twitter !== '') {
        if (twitter.length > 200) {
            errors.push('Twitter URL is too long (max 200 characters)');
        }
        if (!validator.isURL(twitter, { require_protocol: true })) {
            errors.push('Invalid Twitter URL format');
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