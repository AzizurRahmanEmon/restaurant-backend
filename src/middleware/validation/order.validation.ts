// ============================================
// ORDER VALIDATORS
// src/middleware/validation/order.validation.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { sanitizeInput, validateObjectId } from './common';

export const validateOrderCreate = (req: Request, res: Response, next: NextFunction) => {
    const { customerId, items, deliveryType, paymentMethod } = req.body;
    const errors: string[] = [];

    if (!customerId || !validateObjectId(customerId)) {
        errors.push('Valid customer ID is required');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.push('Order must contain at least one item');
    } else {
        items.forEach((item, index) => {
            if (!item.productId || !validateObjectId(item.productId)) {
                errors.push(`Invalid product ID at item ${index + 1}`);
            }
            if (!item.quantity || item.quantity < 1) {
                errors.push(`Invalid quantity at item ${index + 1}`);
            }
            if (item.quantity > 1000) {
                errors.push(`Quantity at item ${index + 1} exceeds maximum limit of 1000`);
            }
        });
    }

    if (!deliveryType || !['pickup', 'delivery', 'dine-in'].includes(deliveryType)) {
        errors.push('Invalid delivery type');
    }

    if (!paymentMethod || !['cash', 'card', 'online'].includes(paymentMethod)) {
        errors.push('Invalid payment method');
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

export const validateOrderUpdate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { status, paymentStatus, deliveryType, notes, estimatedDeliveryTime } = req.body;
    const errors: string[] = [];

    const protectedFields = ['_id', 'orderNumber', 'customer', 'items', 'subtotal', 'tax', 'totalAmount', 'createdAt', 'updatedAt', '__v'];
    protectedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            delete req.body[field];
        }
    });

    if (status !== undefined) {
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            errors.push('Status must be one of: pending, confirmed, preparing, ready, delivered, cancelled');
        }
    }

    if (paymentStatus !== undefined) {
        const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
            errors.push('Payment status must be one of: pending, paid, failed, refunded');
        }
    }

    if (deliveryType !== undefined) {
        const validDeliveryTypes = ['pickup', 'delivery', 'dine-in'];
        if (!validDeliveryTypes.includes(deliveryType)) {
            errors.push('Delivery type must be one of: pickup, delivery, dine-in');
        }
    }

    if (notes !== undefined) {
        if (notes.length > 500) {
            errors.push('Notes must be less than 500 characters');
        }
        req.body.notes = sanitizeInput(notes);
    }

    if (estimatedDeliveryTime !== undefined) {
        const deliveryTime = new Date(estimatedDeliveryTime);
        if (isNaN(deliveryTime.getTime())) {
            errors.push('Invalid estimated delivery time format');
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

export const validateOrderStatus = (
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

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be one of: pending, confirmed, preparing, ready, delivered, cancelled'
        });
    }

    next();
};

export const validatePaymentStatus = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
        return res.status(400).json({
            success: false,
            message: 'Payment status is required'
        });
    }

    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({
            success: false,
            message: 'Payment status must be one of: pending, paid, failed, refunded'
        });
    }

    next();
};