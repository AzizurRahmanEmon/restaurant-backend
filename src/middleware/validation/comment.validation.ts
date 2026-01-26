// src/middleware/validation/comment.validation.ts

import { Request, Response, NextFunction } from "express";
import validator from "validator";
import { sanitizeInput } from "./common";

export const validateCommentCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, email, comment } = req.body;
  const errors: string[] = [];

  // Validate name
  if (!name || !name.trim()) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (name.length > 100) {
    errors.push("Name cannot exceed 100 characters");
  }

  // Validate email
  if (!email || !email.trim()) {
    errors.push("Email is required");
  } else if (!validator.isEmail(email.trim())) {
    errors.push("Please provide a valid email address");
  }

  // Validate comment
  if (!comment || !comment.trim()) {
    errors.push("Comment is required");
  } else if (comment.trim().length < 10) {
    errors.push("Comment must be at least 10 characters long");
  } else if (comment.length > 1000) {
    errors.push("Comment cannot exceed 1000 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  // Sanitize inputs
  req.body.name = sanitizeInput(name.trim());
  req.body.email = email.trim().toLowerCase();
  req.body.comment = sanitizeInput(comment.trim());

  next();
};

export const validateCommentLike = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { commentId } = req.params;

  if (!commentId) {
    return res.status(400).json({
      success: false,
      message: "Comment ID is required",
    });
  }

  // Ensure commentId is a string (req.params can be string | string[])
  const id = Array.isArray(commentId) ? commentId[0] : commentId;

  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID",
    });
  }

  next();
};

export const validateCommentApproval = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { isApproved } = req.body;

  if (typeof isApproved !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isApproved must be a boolean value",
    });
  }

  next();
};
