import { Request } from "express";

// Extended Request with user info
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
    role: string;
  };
  params: any;
  body: any;
  query: any;
}

// OTP Storage (in-memory for demo, use Redis in production)
export interface IOtp {
  phone: string;
  otp: string;
  expiresAt: Date;
}
