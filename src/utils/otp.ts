// ============================================
// OTP UTILITIES - Email-based OTP System
// src/utils/otp.ts
// ============================================

import crypto from "crypto";

// In-memory OTP storage (use Redis in production for scalability)
const otpStorage = new Map<string, { otp: string; expiresAt: Date }>();

// Cleanup expired OTPs periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStorage.entries()) {
    if (value.expiresAt.getTime() < now) {
      otpStorage.delete(key);
      console.log(`🧹 Cleaned up expired OTP for: ${key}`);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// GENERATE 6-DIGIT OTP
// ============================================
export const generateOtp = (): string => {
  // Using crypto for secure random number generation
  const buffer = crypto.randomBytes(3);
  const num = buffer.readUIntBE(0, 3);
  const otp = (num % 900000) + 100000; // Ensures 6 digits (100000-999999)
  return otp.toString();
};

// ============================================
// STORE OTP (expires in 5 minutes)
// ============================================
export const storeOtp = (email: string, otp: string): void => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  otpStorage.set(email.toLowerCase(), { otp, expiresAt });
  console.log(
    `✅ OTP stored for ${email} (expires at ${expiresAt.toISOString()})`
  );
};

// ============================================
// VERIFY OTP
// ============================================
export const verifyOtp = (email: string, otp: string): boolean => {
  const normalizedEmail = email.toLowerCase();
  const stored = otpStorage.get(normalizedEmail);

  if (!stored) {
    console.log(`❌ No OTP found for ${email}`);
    return false;
  }

  // Check if expired
  if (new Date() > stored.expiresAt) {
    otpStorage.delete(normalizedEmail);
    console.log(`⏰ OTP expired for ${email}`);
    return false;
  }

  // Check if OTP matches
  if (stored.otp === otp) {
    otpStorage.delete(normalizedEmail); // Remove after successful verification
    console.log(`✅ OTP verified successfully for ${email}`);
    return true;
  }

  console.log(`❌ Invalid OTP for ${email}`);
  return false;
};

// ============================================
// DELETE OTP (for cleanup or manual invalidation)
// ============================================
export const deleteOtp = (email: string): void => {
  otpStorage.delete(email.toLowerCase());
  console.log(`🗑️ OTP deleted for ${email}`);
};

// ============================================
// GENERATE RESET PASSWORD TOKEN (64 chars hex)
// ============================================
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// ============================================
// HASH TOKEN (for storing in database)
// ============================================
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ============================================
// GET OTP STORAGE SIZE (for monitoring)
// ============================================
export const getOtpStorageSize = (): number => {
  return otpStorage.size;
};
