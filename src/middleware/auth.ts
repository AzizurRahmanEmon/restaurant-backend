import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../types";

// Track failed login attempts (Use Redis in production)
const failedAttempts = new Map<string, { count: number; lockUntil?: number }>();

// Cleanup expired locks periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of failedAttempts.entries()) {
    if (value.lockUntil && value.lockUntil < now) {
      failedAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean every hour

// ============================================
// Track Failed Login Attempts
// ============================================
export const trackFailedLogin = (identifier: string) => {
  const attempts = failedAttempts.get(identifier) || { count: 0 };
  attempts.count++;
  attempts.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
  failedAttempts.set(identifier, attempts);
};

export const resetFailedAttempts = (identifier: string) => {
  failedAttempts.delete(identifier);
};

export const checkAccountLock = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
  const { email } = req.body;

  if (!email) {
    return next();
  }

  const attempts = failedAttempts.get(email);

  if (attempts && attempts.count >= 5) {
    const lockTime = attempts.lockUntil || 0;
    if (Date.now() < lockTime) {
      const minutesLeft = Math.ceil((lockTime - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minutes`,
      });
    } else {
      failedAttempts.delete(email);
    }
  }

  next();
};

// ============================================
// Protect Routes - Verify JWT Token
// ============================================
export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
  try {
    let token;

    // Check for Bearer token in headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Token validation
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. Please login.",
      });
    }

    // Check token length (prevent DOS attacks)
    if (token.length > 500) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
      ) as any;

      // Find user by id
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found. Token is invalid.",
        });
      }

      // Attach user to request
      req.user = {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        role: user.role,
      };

      next();
    } catch (error: any) {
      // Distinguish between expired and invalid tokens
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please login again.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Token is invalid or malformed",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

// ============================================
// Verify API Key for Frontend Requests
// ============================================
export const verifyApiKey = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API key is required",
      });
    }

    // Validate API key format
    if (apiKey.length > 500 || !/^rk_[a-f0-9]{64}$/i.test(apiKey)) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key format",
      });
    }

    // Find user with this API key
    const user = await User.findOne({
      "apiKeys.key": apiKey,
      "apiKeys.isActive": true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or inactive API key",
      });
    }

    // Update last used date for the API key
    const keyIndex = user.apiKeys.findIndex((k) => k.key === apiKey);
    if (keyIndex !== -1) {
      user.apiKeys[keyIndex].lastUsedAt = new Date();
      await user.save();
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in API key verification",
    });
  }
};

// ============================================
// Authorize Specific Roles
// ============================================
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};