// ============================================
// SETTINGS VALIDATORS
// src/middleware/validation/settings.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { sanitizeInput, validateEmail, validatePhone } from './common';

export const validateRestaurantInfo = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { restaurantName, email, phone, address, description, logo } = req.body;
    const errors: string[] = [];

    if (restaurantName !== undefined) {
        if (restaurantName.trim().length < 2) {
            errors.push('Restaurant name must be at least 2 characters');
        }
        if (restaurantName.length > 200) {
            errors.push('Restaurant name is too long (max 200 characters)');
        }
        req.body.restaurantName = sanitizeInput(restaurantName);
    }

    if (email !== undefined) {
        if (!validateEmail(email)) {
            errors.push('Valid email is required');
        }
        req.body.email = validator.normalizeEmail(email) || email;
    }

    if (phone !== undefined) {
        if (!validatePhone(phone)) {
            errors.push('Valid phone number is required');
        }
        req.body.phone = phone.trim();
    }

    if (address !== undefined) {
        if (address.trim().length < 5) {
            errors.push('Address must be at least 5 characters');
        }
        if (address.length > 500) {
            errors.push('Address is too long (max 500 characters)');
        }
        req.body.address = sanitizeInput(address);
    }

    if (description !== undefined && description !== '') {
        if (description.length > 1000) {
            errors.push('Description is too long (max 1000 characters)');
        }
        req.body.description = sanitizeInput(description);
    }

    if (logo !== undefined && logo !== '') {
        if (logo.length > 500) {
            errors.push('Logo URL is too long (max 500 characters)');
        }
        if (!/^https?:\/\/.+\..+/i.test(logo)) {
            errors.push('Invalid logo URL format');
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

export const validateBusinessHours = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { businessHours } = req.body;
    const errors: string[] = [];

    if (!businessHours) {
        return res.status(400).json({
            success: false,
            message: 'Business hours array is required'
        });
    }

    if (!Array.isArray(businessHours)) {
        return res.status(400).json({
            success: false,
            message: 'Business hours must be an array'
        });
    }

    if (businessHours.length > 7) {
        return res.status(400).json({
            success: false,
            message: 'Business hours cannot exceed 7 days'
        });
    }

    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    businessHours.forEach((day: any, index: number) => {
        if (!day.day || !validDays.includes(day.day.toLowerCase())) {
            errors.push(`Invalid day at index ${index}. Must be a valid day of the week`);
        }

        if (day.open !== undefined && day.open !== '' && !timeRegex.test(day.open)) {
            errors.push(`Invalid opening time at index ${index}. Format must be HH:MM`);
        }

        if (day.close !== undefined && day.close !== '' && !timeRegex.test(day.close)) {
            errors.push(`Invalid closing time at index ${index}. Format must be HH:MM`);
        }

        // ✅ FIX: Changed from isOpen to isClosed
        if (typeof day.isClosed !== 'boolean') {
            errors.push(`isClosed must be a boolean at index ${index}`);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

export const validateNotifications = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { notifications } = req.body;

    if (!notifications) {
        return res.status(400).json({
            success: false,
            message: 'Notifications object is required'
        });
    }

    if (typeof notifications !== 'object' || Array.isArray(notifications)) {
        return res.status(400).json({
            success: false,
            message: 'Notifications must be an object'
        });
    }

    const errors: string[] = [];
    // ✅ FIX: Updated to match your model's field names
    const validFields = ['newOrders', 'newReservations', 'lowStockAlerts', 'newMessages'];

    Object.keys(notifications).forEach(key => {
        if (!validFields.includes(key)) {
            errors.push(`Invalid notification field: ${key}`);
        }
        if (typeof notifications[key] !== 'boolean') {
            errors.push(`${key} must be a boolean value`);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

export const validateSocialMedia = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { socialMedia } = req.body;

    if (!socialMedia) {
        return res.status(400).json({
            success: false,
            message: 'Social media object is required'
        });
    }

    if (typeof socialMedia !== 'object' || Array.isArray(socialMedia)) {
        return res.status(400).json({
            success: false,
            message: 'Social media must be an object'
        });
    }

    const errors: string[] = [];
    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];

    Object.keys(socialMedia).forEach(platform => {
        if (!validPlatforms.includes(platform)) {
            errors.push(`Invalid social media platform: ${platform}`);
        }

        const url = socialMedia[platform];
        if (url && url !== '') {
            if (url.length > 300) {
                errors.push(`${platform} URL is too long (max 300 characters)`);
            }
            if (!validator.isURL(url, { require_protocol: true })) {
                errors.push(`${platform} URL is invalid`);
            }
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

export const validateGeneralSettings = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const {
        currency,
        timezone,
        taxRate,
        deliveryFee,
        minimumOrderAmount,
        allowOnlineOrdering,
        allowReservations
    } = req.body;
    const errors: string[] = [];

    if (currency !== undefined) {
        if (typeof currency !== 'string' || currency.length !== 3) {
            errors.push('Currency must be a 3-letter ISO code (e.g., USD, EUR)');
        }
        if (!/^[A-Z]{3}$/.test(currency)) {
            errors.push('Currency must be uppercase letters only');
        }
    }

    if (timezone !== undefined) {
        if (typeof timezone !== 'string' || timezone.length < 3 || timezone.length > 50) {
            errors.push('Invalid timezone format');
        }
    }

    if (taxRate !== undefined) {
        const rate = Number(taxRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            errors.push('Tax rate must be between 0 and 100');
        }
    }

    if (deliveryFee !== undefined) {
        const fee = Number(deliveryFee);
        if (isNaN(fee) || fee < 0) {
            errors.push('Delivery fee must be a non-negative number');
        }
        if (fee > 10000) {
            errors.push('Delivery fee seems unrealistic (max 10,000)');
        }
    }

    if (minimumOrderAmount !== undefined) {
        const amount = Number(minimumOrderAmount);
        if (isNaN(amount) || amount < 0) {
            errors.push('Minimum order amount must be a non-negative number');
        }
        if (amount > 100000) {
            errors.push('Minimum order amount seems unrealistic (max 100,000)');
        }
    }

    if (allowOnlineOrdering !== undefined && typeof allowOnlineOrdering !== 'boolean') {
        errors.push('allowOnlineOrdering must be a boolean value');
    }

    if (allowReservations !== undefined && typeof allowReservations !== 'boolean') {
        errors.push('allowReservations must be a boolean value');
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

export const validateSettingsUpdate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors: string[] = [];

    const protectedFields = ['_id', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (req.body.restaurantName !== undefined) {
        if (req.body.restaurantName.trim().length < 2) {
            errors.push('Restaurant name must be at least 2 characters');
        }
    }

    if (req.body.email !== undefined) {
        if (!validateEmail(req.body.email)) {
            errors.push('Invalid email format');
        }
    }

    if (req.body.phone !== undefined) {
        if (!validatePhone(req.body.phone)) {
            errors.push('Invalid phone number format');
        }
    }

    if (req.body.taxRate !== undefined) {
        const rate = Number(req.body.taxRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            errors.push('Tax rate must be between 0 and 100');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    if (req.body.restaurantName) {
        req.body.restaurantName = sanitizeInput(req.body.restaurantName);
    }
    if (req.body.address) {
        req.body.address = sanitizeInput(req.body.address);
    }
    if (req.body.description) {
        req.body.description = sanitizeInput(req.body.description);
    }

    next();
};