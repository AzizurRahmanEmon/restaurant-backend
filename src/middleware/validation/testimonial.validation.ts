// ============================================
// TESTIMONIAL VALIDATORS - FIXED
// src/middleware/validation/testimonial.validation.ts
// ============================================

import { Request, Response, NextFunction } from "express";
import { sanitizeInput } from "./common";

export const validateTestimonialCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, testimony, rating, position, img } = req.body;
  const errors: string[] = [];

  // Validate name (matches your model field)
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (name && name.length > 100) {
    errors.push("Name is too long (max 100 characters)");
  }

  // Validate testimony (matches your model field)
  if (!testimony || testimony.trim().length < 10) {
    errors.push("Testimony must be at least 10 characters");
  }

  if (testimony && testimony.length > 1000) {
    errors.push("Testimony is too long (max 1000 characters)");
  }

  // Validate position (matches your model field)
  if (!position || position.trim().length < 2) {
    errors.push("Position is required and must be at least 2 characters");
  }

  if (position && position.length > 100) {
    errors.push("Position is too long (max 100 characters)");
  }

  // Validate image
  if (!img || img.trim().length === 0) {
    errors.push("Image is required");
  }

  // Validate rating
  if (rating !== undefined) {
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      errors.push("Rating must be between 1 and 5");
    }
    if (!Number.isInteger(ratingNum)) {
      errors.push("Rating must be an integer");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  // Sanitize inputs
  req.body.name = sanitizeInput(name);
  req.body.testimony = sanitizeInput(testimony);
  req.body.position = sanitizeInput(position);

  next();
};

export const validateTestimonialUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    name,
    testimony,
    rating,
    position,
    img,
    displayOrder,
    isActive,
    isFeatured,
  } = req.body;
  const errors: string[] = [];

  // Remove protected fields
  const protectedFields = ["_id", "createdBy", "createdAt", "updatedAt", "__v"];
  protectedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      delete req.body[field];
    }
  });

  // Validate name if provided
  if (name !== undefined) {
    if (name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    if (name.length > 100) {
      errors.push("Name is too long (max 100 characters)");
    }
    req.body.name = sanitizeInput(name);
  }

  // Validate testimony if provided
  if (testimony !== undefined) {
    if (testimony.trim().length < 10) {
      errors.push("Testimony must be at least 10 characters");
    }
    if (testimony.length > 1000) {
      errors.push("Testimony is too long (max 1000 characters)");
    }
    req.body.testimony = sanitizeInput(testimony);
  }

  // Validate position if provided
  if (position !== undefined) {
    if (position.trim().length < 2) {
      errors.push("Position must be at least 2 characters");
    }
    if (position.length > 100) {
      errors.push("Position is too long (max 100 characters)");
    }
    req.body.position = sanitizeInput(position);
  }

  // Validate rating if provided
  if (rating !== undefined) {
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      errors.push("Rating must be between 1 and 5");
    }
    if (!Number.isInteger(ratingNum)) {
      errors.push("Rating must be an integer");
    }
  }

  // Validate displayOrder if provided
  if (displayOrder !== undefined) {
    if (!Number.isInteger(Number(displayOrder)) || Number(displayOrder) < 0) {
      errors.push("Display order must be a non-negative integer");
    }
    if (Number(displayOrder) > 9999) {
      errors.push("Display order is too large (max 9999)");
    }
  }

  // Validate isActive if provided
  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be a boolean value");
  }

  // Validate isFeatured if provided
  if (isFeatured !== undefined && typeof isFeatured !== "boolean") {
    errors.push("isFeatured must be a boolean value");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  next();
};
