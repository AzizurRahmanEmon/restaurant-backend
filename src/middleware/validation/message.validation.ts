// ============================================
// MESSAGE VALIDATORS
// src/middleware/validation/message.validation.ts
// ============================================

import { Request, Response, NextFunction } from "express";
import validator from "validator";
import { sanitizeInput, validateEmail, validatePhone, validateObjectId } from "./common";

export const validateMessageCreate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, phone, subject, message } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!email || !validateEmail(email)) {
    errors.push("Valid email is required");
  }

  if (phone && !validatePhone(phone)) {
    errors.push("Invalid phone number format");
  }

  if (!subject || subject.trim().length < 3) {
    errors.push("Subject must be at least 3 characters");
  }

  if (!message || message.trim().length < 10) {
    errors.push("Message must be at least 10 characters");
  }

  if (message && message.length > 5000) {
    errors.push("Message is too long. Maximum 5000 characters allowed");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  req.body.name = sanitizeInput(name);
  req.body.email = validator.normalizeEmail(email) || email;
  req.body.subject = sanitizeInput(subject);
  req.body.message = sanitizeInput(message);
  if (phone) req.body.phone = phone.trim();

  next();
};

export const validateMessageUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, phone, subject, message, status, response } = req.body;
  const errors: string[] = [];

  const protectedFields = ["_id", "createdAt", "updatedAt", "__v"];
  protectedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      delete req.body[field];
    }
  });

  if (name !== undefined) {
    if (name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    req.body.name = sanitizeInput(name);
  }

  if (email !== undefined) {
    if (!validateEmail(email)) {
      errors.push("Valid email is required");
    }
    req.body.email = validator.normalizeEmail(email) || email;
  }

  if (phone !== undefined && phone !== "") {
    if (!validatePhone(phone)) {
      errors.push("Invalid phone number format");
    }
    req.body.phone = phone.trim();
  }

  if (subject !== undefined) {
    if (subject.trim().length < 3) {
      errors.push("Subject must be at least 3 characters");
    }
    req.body.subject = sanitizeInput(subject);
  }

  if (message !== undefined) {
    if (message.trim().length < 10) {
      errors.push("Message must be at least 10 characters");
    }
    if (message.length > 5000) {
      errors.push("Message is too long. Maximum 5000 characters allowed");
    }
    req.body.message = sanitizeInput(message);
  }

  if (status !== undefined) {
    const validStatuses = ["unread", "read", "replied", "archived"];
    if (!validStatuses.includes(status)) {
      errors.push("Status must be one of: unread, read, replied, archived");
    }
  }

  if (response !== undefined) {
    if (response.length > 5000) {
      errors.push("Response is too long. Maximum 5000 characters allowed");
    }
    req.body.response = sanitizeInput(response);
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

export const validateMessageStatus = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  const validStatuses = ["unread", "read", "replied", "archived"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be one of: unread, read, replied, archived",
    });
  }

  next();
};

export const validateMessageReply = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { replyMessage } = req.body;
  const errors: string[] = [];

  // Add detailed logging for debugging
  console.log("🔍 Reply Validation Debug:", {
    replyMessage,
    replyMessageType: typeof replyMessage,
    replyMessageLength: replyMessage?.length,
    trimmedLength: replyMessage?.trim()?.length,
    body: req.body,
  });

  if (!replyMessage) {
    errors.push("Reply message is required");
  } else if (typeof replyMessage !== "string") {
    errors.push("Reply message must be a string");
  } else if (replyMessage.trim().length < 10) {
    errors.push(
      `Reply message must be at least 10 characters (currently ${
        replyMessage.trim().length
      })`
    );
  } else if (replyMessage.length > 5000) {
    errors.push("Reply message is too long (max 5000 characters)");
  }

  if (errors.length > 0) {
    console.error("❌ Reply validation failed:", errors);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  // Sanitize the reply message
  req.body.replyMessage = sanitizeInput(replyMessage);

  console.log("✅ Reply validation passed");
  next();
};

export const validateBulkDelete = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { ids } = req.body;

  if (!ids) {
    return res.status(400).json({
      success: false,
      message: "IDs array is required",
    });
  }

  if (!Array.isArray(ids)) {
    return res.status(400).json({
      success: false,
      message: "IDs must be an array",
    });
  }

  if (ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "IDs array cannot be empty",
    });
  }

  if (ids.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete more than 100 items at once",
    });
  }

  const invalidIds = ids.filter((id: string) => !validateObjectId(id));
  if (invalidIds.length > 0) {
    return res.status(400).json({
      success: false,
      message: "One or more IDs have invalid format",
    });
  }

  next();
};
