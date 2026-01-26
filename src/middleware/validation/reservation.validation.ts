// ============================================
// RESERVATION VALIDATORS
// src/middleware/validation/reservation.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { sanitizeInput, validateEmail, validatePhone, validateDate } from './common';

export const validateReservationCreate = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, date, time, numberOfGuests } = req.body;
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

    if (!date || !validateDate(date)) {
        errors.push('Valid date is required (ISO 8601 format)');
    } else {
        const reservationDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (reservationDate < today) {
            errors.push('Reservation date cannot be in the past');
        }
    }

    if (!time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
        errors.push('Valid time is required (HH:MM format)');
    }

    const guests = Number(numberOfGuests);
    if (!numberOfGuests || isNaN(guests) || guests < 1 || guests > 20) {
        errors.push('Number of guests must be between 1 and 20');
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

export const validateReservationUpdate = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, date, time, numberOfGuests, status, specialRequests } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'customer', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (name !== undefined) {
        if (name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
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

    if (date !== undefined) {
        if (!validateDate(date)) {
            errors.push('Valid date is required (ISO 8601 format)');
        } else {
            const reservationDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (reservationDate < today) {
                errors.push('Reservation date cannot be in the past');
            }
        }
    }

    if (time !== undefined) {
        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
            errors.push('Valid time is required (HH:MM format)');
        }
    }

    if (numberOfGuests !== undefined) {
        const guests = Number(numberOfGuests);
        if (isNaN(guests) || guests < 1 || guests > 20) {
            errors.push('Number of guests must be between 1 and 20');
        }
    }

    if (status !== undefined) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            errors.push('Status must be one of: pending, confirmed, cancelled, completed');
        }
    }

    if (specialRequests !== undefined) {
        if (specialRequests.length > 500) {
            errors.push('Special requests must be less than 500 characters');
        }
        req.body.specialRequests = sanitizeInput(specialRequests);
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

export const validateReservationStatus = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be one of: pending, confirmed, cancelled, completed'
        });
    }

    next();
};

export const validateAvailableSlotsQuery = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'Date parameter is required'
        });
    }

    if (!validateDate(date as string)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'
        });
    }

    const queryDate = new Date(date as string);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (queryDate < today) {
        return res.status(400).json({
            success: false,
            message: 'Cannot check availability for past dates'
        });
    }

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    if (queryDate > sixMonthsFromNow) {
        return res.status(400).json({
            success: false,
            message: 'Cannot check availability more than 6 months in advance'
        });
    }

    next();
};

export const validateReservationFilters = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { status, date, startDate, endDate } = req.query;

    if (status) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status as string)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status filter. Must be one of: pending, confirmed, cancelled, completed'
            });
        }
    }

    if (date) {
        if (!validateDate(date as string)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        const queryDate = new Date(date as string);
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

        if (queryDate < twoYearsAgo) {
            return res.status(400).json({
                success: false,
                message: 'Cannot query reservations more than 2 years in the past'
            });
        }
    }

    if (startDate || endDate) {
        if (startDate && !validateDate(startDate as string)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid start date format'
            });
        }

        if (endDate && !validateDate(endDate as string)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid end date format'
            });
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
            if (diffYears > 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Date range cannot exceed 1 year'
                });
            }
        }

        if (startDate) {
            const start = new Date(startDate as string);
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

            if (start < twoYearsAgo) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot query reservations more than 2 years in the past'
                });
            }
        }
    }

    next();
};