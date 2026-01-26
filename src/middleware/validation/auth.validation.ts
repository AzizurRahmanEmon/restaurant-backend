// ============================================
// AUTH VALIDATORS
// src/middleware/validation/auth.validation.ts
// ============================================

import { Request, Response, NextFunction } from "express";
import validator from "validator";
import rateLimit from "express-rate-limit";
import { sanitizeInput } from "./common";

// ============================================
// RATE LIMITERS
// ============================================

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  message: {
    success: false,
    message: "Too many password reset requests. Please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// AUTH VALIDATORS
// ============================================

export const validateAuthEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const sanitizedEmail = validator.trim(email.toLowerCase());

  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (sanitizedEmail.length > 254) {
    return res.status(400).json({
      success: false,
      message: "Email is too long",
    });
  }

  req.body.email = sanitizedEmail;
  next();
};

export const validateAuthPhone = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  const sanitizedPhone = phone.replace(/[^\d+]/g, "");

  if (!validator.isMobilePhone(sanitizedPhone, "any", { strictMode: false })) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number format",
    });
  }

  if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be between 10-15 digits",
    });
  }

  req.body.phone = sanitizedPhone;
  next();
};

export const validateAuthPassword = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { password, newPassword } = req.body;
  const passwordToCheck = password || newPassword;

  if (!passwordToCheck) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }

  if (passwordToCheck.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  if (passwordToCheck.length > 128) {
    return res.status(400).json({
      success: false,
      message: "Password is too long (max 128 characters)",
    });
  }

  const hasUpperCase = /[A-Z]/.test(passwordToCheck);
  const hasLowerCase = /[a-z]/.test(passwordToCheck);
  const hasNumber = /\d/.test(passwordToCheck);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordToCheck);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return res.status(400).json({
      success: false,
      message:
        "Password must contain at least one uppercase letter, lowercase letter, number, and special character",
    });
  }

  next();
};

export const validateAuthOTP = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is required",
    });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP format. Must be 6 digits",
    });
  }

  next();
};

export const validateApiKeyName = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "API key name is required",
    });
  }

  const sanitizedName = validator.trim(name);

  if (sanitizedName.length < 3) {
    return res.status(400).json({
      success: false,
      message: "API key name must be at least 3 characters",
    });
  }

  if (sanitizedName.length > 50) {
    return res.status(400).json({
      success: false,
      message: "API key name is too long (max 50 characters)",
    });
  }

  req.body.name = sanitizeInput(sanitizedName);
  next();
};

export const validateResetToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { resetToken } = req.params;

  if (!resetToken) {
    return res.status(400).json({
      success: false,
      message: "Reset token is required",
    });
  }

  // Ensure resetToken is a string (req.params can be string | string[])
  const token = Array.isArray(resetToken) ? resetToken[0] : resetToken;

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reset token format",
    });
  }

  next();
};

export const validateApiKeyFormat = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { key } = req.params;

  if (!key) {
    return res.status(400).json({
      success: false,
      message: "API key is required",
    });
  }

  // Ensure key is a string (req.params can be string | string[])
  const apiKey = Array.isArray(key) ? key[0] : key;

  if (!apiKey || !/^rk_[a-f0-9]{64}$/i.test(apiKey)) {
    return res.status(400).json({
      success: false,
      message: "Invalid API key format",
    });
  }

  next();
};
