// ============================================
// CUSTOMER VALIDATORS
// src/middleware/validation/customer.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { sanitizeInput, validateEmail, validatePhone } from './common';

export const validateCustomerCreate = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password } = req.body;
    const errors: string[] = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }

    if (!email || !validateEmail(email)) {
        errors.push('Valid email is required');
    }

    if (!phone || !validatePhone(phone)) {
        errors.push('Valid phone number is required');
    }

    if (password && password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    req.body.name = sanitizeInput(name);
    req.body.email = validator.normalizeEmail(email) || email;
    req.body.phone = phone.trim();

    next();
};

export const validateCustomerUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password, address, loyaltyPoints, isActive } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'orderHistory', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (name !== undefined) {
        if (name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        if (name.length > 100) {
            errors.push('Name is too long. Maximum 100 characters allowed');
        }
        req.body.name = sanitizeInput(name);
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

    if (password !== undefined) {
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        if (password.length > 100) {
            errors.push('Password is too long. Maximum 100 characters allowed');
        }
    }

    if (address !== undefined && typeof address === 'object') {
        if (address.street && address.street.length > 200) {
            errors.push('Street address is too long');
        }
        if (address.city && address.city.length > 100) {
            errors.push('City name is too long');
        }
        if (address.street) req.body.address.street = sanitizeInput(address.street);
        if (address.city) req.body.address.city = sanitizeInput(address.city);
        if (address.state) req.body.address.state = sanitizeInput(address.state);
        if (address.zipCode) req.body.address.zipCode = sanitizeInput(address.zipCode);
    }

    if (loyaltyPoints !== undefined) {
        if (!Number.isInteger(Number(loyaltyPoints)) || Number(loyaltyPoints) < 0) {
            errors.push('Loyalty points must be a non-negative integer');
        }
        if (Number(loyaltyPoints) > 1000000) {
            errors.push('Loyalty points value seems unrealistic');
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

export const validateLoyaltyPointsUpdate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { points, action } = req.body;
    const errors: string[] = [];

    if (!points) {
        errors.push('Points value is required');
    }

    if (!action) {
        errors.push('Action is required');
    }

    if (points !== undefined) {
        const pointsNum = Number(points);
        if (isNaN(pointsNum) || pointsNum <= 0) {
            errors.push('Points must be a positive number');
        }
        if (pointsNum > 10000) {
            errors.push('Points value too large (max 10,000 per transaction)');
        }
    }

    if (action !== undefined) {
        const validActions = ['add', 'subtract'];
        if (!validActions.includes(action)) {
            errors.push('Action must be either "add" or "subtract"');
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

export const validateCustomerLogin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, password } = req.body;
    const errors: string[] = [];

    if (!email) {
        errors.push('Email is required');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (email && !validateEmail(email)) {
        errors.push('Invalid email format');
    }

    if (password && password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    if (password && password.length > 100) {
        errors.push('Password is too long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    if (email) {
        req.body.email = email.trim().toLowerCase();
    }

    next();
};