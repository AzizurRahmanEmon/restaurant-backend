import { Request } from "express";

// Extended Request with user info
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
    role: string;
  };
  params: Request["params"];
  body: Request["body"];
  query: Request["query"];
  headers: Request["headers"];
}

// OTP Storage (in-memory for demo, use Redis in production)
export interface IOtp {
  phone: string;
  otp: string;
  expiresAt: Date;
}
