// ============================================
// AUTH ROUTES - Production Ready with Email OTP
// src/routes/auth.ts
// ============================================

import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import User from "../models/User";
import {
  protect,
  checkAccountLock,
  trackFailedLogin,
  resetFailedAttempts,
} from "../middleware/auth";
import { AuthRequest } from "../types";
import {
  generateOtp,
  storeOtp,
  verifyOtp,
  generateResetToken,
  hashToken,
} from "../utils/otp";
import {
  sendOTPEmail,
  sendPasswordResetEmail,
} from "../services/email.service";
import {
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
  validateAuthEmail,
  validateAuthPassword,
  validateAuthOTP,
  validateApiKeyName,
  validateResetToken,
  validateApiKeyFormat,
} from "../middleware/validation";

const router = express.Router();

// ============================================
// GENERATE JWT TOKEN
// ============================================
const generateToken = (id: string): string => {
  try {
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign({ id }, secret, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.error("❌ Token generation error:", error);
    throw new Error("Failed to generate token");
  }
};

// ============================================
// @route   POST /api/auth/login
// @desc    Login with email and password (Step 1) - Sends OTP to email
// @access  Public
// ============================================
router.post(
  "/login",
  loginLimiter,
  checkAccountLock,
  validateAuthEmail,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Please provide password",
        });
      }

      if (password.length > 128) {
        trackFailedLogin(email);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        trackFailedLogin(email);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        trackFailedLogin(email);
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      resetFailedAttempts(email);

      // Generate and store OTP
      const otp = generateOtp();
      storeOtp(user.email, otp);

      // Send OTP via email
      const emailResult = await sendOTPEmail(user.email, otp, user.name);

      if (!emailResult.success) {
        console.error("Failed to send OTP email:", emailResult.error);
        return res.status(500).json({
          success: false,
          message: "Failed to send verification code. Please try again.",
        });
      }

      // Mask email for security
      const maskedEmail = user.email.replace(
        /(.{2})(.*)(@.*)/,
        (_, start, middle, end) => start + "*".repeat(middle.length) + end,
      );

      res.json({
        success: true,
        message: "Credentials verified. OTP sent to your email.",
        data: {
          email: maskedEmail,
          ...(process.env.NODE_ENV === "development" && { otp }), // Only in dev
        },
      });
    } catch (error: any) {
      console.error("❌ Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  },
);

// ============================================
// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete login (Step 2)
// @access  Public
// ============================================
router.post(
  "/verify-otp",
  otpLimiter,
  validateAuthEmail,
  validateAuthOTP,
  async (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;

      const isValid = verifyOtp(email, otp);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const token = generateToken(user._id.toString());

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            name: user.name,
          },
        },
      });
    } catch (error: any) {
      console.error("❌ OTP verification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during OTP verification",
      });
    }
  },
);

// ============================================
// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to email
// @access  Public
// ============================================
router.post(
  "/resend-otp",
  otpLimiter,
  validateAuthEmail,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      // Always return success message for security (prevent email enumeration)
      if (!user) {
        return res.json({
          success: true,
          message: "If this email is registered, a new OTP has been sent",
        });
      }

      // Generate and store new OTP
      const otp = generateOtp();
      storeOtp(user.email, otp);

      // Send OTP via email
      const emailResult = await sendOTPEmail(user.email, otp, user.name);

      if (!emailResult.success) {
        console.error("Failed to send OTP email:", emailResult.error);
      }

      res.json({
        success: true,
        message: "If this email is registered, a new OTP has been sent",
        data: {
          ...(process.env.NODE_ENV === "development" && { otp }), // Only in dev
        },
      });
    } catch (error: any) {
      console.error("❌ Resend OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while resending OTP",
      });
    }
  },
);

// ============================================
// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
// ============================================
router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        apiKeys: user.apiKeys.map((key) => ({
          name: key.name,
          key: `${key.key.substring(0, 12)}...`,
          isActive: key.isActive,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt,
        })),
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("❌ Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile",
    });
  }
});

// ============================================
// @route   PUT /api/auth/change-password
// @desc    Change password (logged in user)
// @access  Private
// ============================================
router.put(
  "/change-password",
  protect,
  validateAuthPassword,
  async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide current password",
        });
      }

      const user = await User.findById(req.user?.id).select("+password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      const isSamePassword = await user.comparePassword(newPassword);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from current password",
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error: any) {
      console.error("❌ Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while changing password",
      });
    }
  },
);

// ============================================
// @route   POST /api/auth/api-keys
// @desc    Generate new API key
// @access  Private
// ============================================
router.post(
  "/api-keys",
  protect,
  validateApiKeyName,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name } = req.body;

      const user = await User.findById(req.user?.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.apiKeys.length >= 10) {
        return res.status(400).json({
          success: false,
          message: "Maximum API key limit reached (10 keys)",
        });
      }

      // Generate secure API key
      const apiKey = `rk_${crypto.randomBytes(32).toString("hex")}`;

      user.apiKeys.push({
        key: apiKey,
        name,
        isActive: true,
        createdAt: new Date(),
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: "API key generated successfully",
        data: {
          apiKey,
          name,
          createdAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error("❌ Generate API key error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while generating API key",
      });
    }
  },
);

// ============================================
// @route   GET /api/auth/api-keys
// @desc    Get all API keys
// @access  Private
// ============================================
router.get("/api-keys", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const maskedKeys = user.apiKeys.map((key) => ({
      name: key.name,
      key: `${key.key.substring(0, 12)}...`,
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
    }));

    res.json({
      success: true,
      count: user.apiKeys.length,
      data: maskedKeys,
    });
  } catch (error: any) {
    console.error("❌ Get API keys error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching API keys",
    });
  }
});

// ============================================
// @route   DELETE /api/auth/api-keys/:key
// @desc    Delete API key
// @access  Private
// ============================================
router.delete(
  "/api-keys/:key",
  protect,
  validateApiKeyFormat,
  async (req: AuthRequest, res: Response) => {
    try {
      const { key } = req.params;

      const user = await User.findById(req.user?.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const initialLength = user.apiKeys.length;
      user.apiKeys = user.apiKeys.filter((k) => k.key !== key);

      if (user.apiKeys.length === initialLength) {
        return res.status(404).json({
          success: false,
          message: "API key not found",
        });
      }

      await user.save();

      res.json({
        success: true,
        message: "API key deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Delete API key error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while deleting API key",
      });
    }
  },
);
// src/routes/auth.ts - Add these routes to your existing auth routes

// ============================================
// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
// ============================================
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateAuthEmail,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      // Always return success message for security (prevent email enumeration)
      if (!user) {
        return res.json({
          success: true,
          message:
            "If an account exists with this email, a verification code has been sent",
        });
      }

      // Generate and store OTP
      const otp = generateOtp();
      storeOtp(user.email, otp);

      // Send OTP via email
      const emailResult = await sendOTPEmail(user.email, otp, user.name);

      if (!emailResult.success) {
        console.error("Failed to send password reset OTP:", emailResult.error);
      }

      res.json({
        success: true,
        message:
          "If an account exists with this email, a verification code has been sent",
        data: {
          ...(process.env.NODE_ENV === "development" && { otp }), // Only in dev
        },
      });
    } catch (error: any) {
      console.error("❌ Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while processing password reset",
      });
    }
  },
);

// ============================================
// @route   PUT /api/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
// ============================================
router.put(
  "/reset-password",
  validateAuthEmail,
  validateAuthOTP,
  validateAuthPassword,
  async (req: Request, res: Response) => {
    try {
      const { email, otp, password } = req.body;

      // Verify OTP
      const isValid = verifyOtp(email, otp);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired verification code",
        });
      }

      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update password
      user.password = password;
      await user.save();

      res.json({
        success: true,
        message:
          "Password reset successful. You can now login with your new password.",
      });
    } catch (error: any) {
      console.error("❌ Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during password reset",
      });
    }
  },
);

// ============================================
// @route   PUT /api/auth/profile
// @desc    Update user profile (name, phone)
// @access  Private
// ============================================
router.put("/profile", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Name must be at least 2 characters",
        });
      }
      if (name.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name is too long (max 100 characters)",
        });
      }
      user.name = name.trim();
    }

    // Validate phone if provided
    if (phone !== undefined) {
      const sanitizedPhone = phone.replace(/[^\d+]/g, "");
      if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be between 10-15 digits",
        });
      }
      user.phone = sanitizedPhone;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
});

// ============================================
// @route   PUT /api/auth/email
// @desc    Update user email (requires password confirmation)
// @access  Private
// ============================================
router.put(
  "/email",
  protect,
  validateAuthEmail,
  async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required to change email",
        });
      }

      const user = await User.findById(req.user?.id).select("+password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password",
        });
      }

      // Check if email is already in use
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      user.email = email;
      await user.save();

      res.json({
        success: true,
        message: "Email updated successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } catch (error: any) {
      console.error("❌ Update email error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating email",
      });
    }
  },
);
export default router;
