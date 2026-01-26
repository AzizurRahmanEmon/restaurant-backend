import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const DATABASE = process.env.DATABASE;
export const JWT_KEY = process.env.JWT_KEY || "your-secret-key";
export const JWT_EXPIRE_TIME = 30 * 24 * 60 * 60;

// Email configuration
export const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
export const EMAIL_PORT = parseInt(process.env.EMAIL_PORT) || 587;
export const EMAIL_SECURITY = false;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_UL_AUTH = false;

// App configuration
export const WEB_CACHE = false;
export const MAX_JSON_SIZE = "10mb";
export const URL_ENCODE = true;

// Rate limiting
export const REQUEST_TIME = 20 * 60 * 1000;
export const REQUEST_NUMBER = 2000;
