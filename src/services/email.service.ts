// src/services/email.service.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (to: string, otp: string, name?: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Zestify <onboarding@resend.dev>",
      to: [to],
      subject: "Your Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${name || "there"},</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      text: `Your verification code is: ${otp}. This code will expire in 5 minutes.`,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("OTP Email sent:", data?.id);
    return { success: true };
  } catch (error: any) {
    console.error("Email Service Error:", error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string,
  name?: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Zestify <onboarding@resend.dev>",
      to: [to],
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${name || "there"},</h2>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
      text: `Reset your password by clicking this link: ${resetUrl}. This link will expire in 10 minutes.`,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    console.log("Password Reset Email sent:", data?.id);
    return { success: true };
  } catch (error: any) {
    console.error("Email Service Error:", error);
    return { success: false, error: error.message };
  }
};
