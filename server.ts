// server.ts
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { connectDB } from "./src/config/database";

// Load env vars
dotenv.config();

// Initialize express app
const app: Application = express();

// Basic Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security Middleware (Apply BEFORE routes)
app.use(helmet()); // Secure HTTP headers

// Prevent MongoDB injection - Manual approach that doesn't modify req.query
app.use((req: Request, res: Response, next: NextFunction) => {
  // Sanitize body (safe to modify)
  if (req.body) {
    req.body = sanitizeNoSQL(req.body);
  }

  // Sanitize params (safe to modify)
  if (req.params) {
    req.params = sanitizeNoSQL(req.params);
  }

  // For query params, we can't modify req.query directly
  // but we can validate and reject dangerous ones
  if (req.query) {
    const hasInjection = checkForNoSQLInjection(req.query);
    if (hasInjection) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters detected",
      });
    }
  }

  next();
});

// Helper function to remove MongoDB operators
function sanitizeNoSQL(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeNoSQL(item));
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      // ✅ FIX: Use Object.prototype.hasOwnProperty.call
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Remove keys that start with $ or contain .
        if (key.startsWith("$") || key.includes(".")) {
          console.warn(`🚨 Blocked NoSQL injection attempt: ${key}`);
          continue; // Skip this key
        }
        sanitized[key] = sanitizeNoSQL(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

// Helper to check for injection in query params (read-only)
function checkForNoSQLInjection(obj: any): boolean {
  if (obj === null || obj === undefined) return false;

  if (typeof obj === "string") {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => checkForNoSQLInjection(item));
  }

  if (typeof obj === "object") {
    for (const key in obj) {
      // ✅ FIX: Use Object.prototype.hasOwnProperty.call
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Check if key contains MongoDB operators
        if (key.startsWith("$") || key.includes(".")) {
          return true;
        }
        if (checkForNoSQLInjection(obj[key])) {
          return true;
        }
      }
    }
  }

  return false;
}

// XSS Protection - Sanitize body and params only
app.use((req: Request, _res: Response, next: NextFunction) => {
  try {
    // Sanitize body
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      req.body = sanitizeRequestData(req.body);
    }

    // Sanitize params
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeRequestData(req.params);
    }

    // Don't touch req.query - it's read-only
  } catch (error) {
    console.warn("XSS sanitization warning:", error);
  }
  next();
});

// Helper function for XSS sanitization
function sanitizeRequestData(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    if (typeof obj === "string") {
      // Remove HTML tags and escape special characters
      return obj
        .replace(/<[^>]*>/g, "")
        .replace(/[&<>"']/g, (char) => {
          const escapeMap: { [key: string]: string } = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
          };
          return escapeMap[char] || char;
        })
        .trim();
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeRequestData(item));
  }

  const sanitized: any = {};
  for (const key in obj) {
    // ✅ FIX: Use Object.prototype.hasOwnProperty.call
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeRequestData(obj[key]);
    }
  }
  return sanitized;
}

app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate limiting (Apply to all /api routes)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per IP
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Import routes
import authRoutes from "./src/routes/auth";
import customersRoutes from "./src/routes/customers";
import orderRoutes from "./src/routes/orders";
import reservationRoutes from "./src/routes/reservations";
import productRoutes from "./src/routes/products";
import chefRoutes from "./src/routes/chefs";
import blogRoutes from "./src/routes/blogs";
import galleryRoutes from "./src/routes/gallery";
import messageRoutes from "./src/routes/messages";
import partnerRoutes from "./src/routes/partners";
import testimonialRoutes from "./src/routes/testimonials";
import serviceRoutes from "./src/routes/services";
import settingsRoutes from "./src/routes/settings";
import dashboardRoutes from "./src/routes/dashboard";

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chefs", chefRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "🍽️ Restaurant API Server - Zestify",
    version: "1.0.0",
    status: "Running",
    endpoints: {
      auth: "/api/auth",
      customers: "/api/customers",
      orders: "/api/orders",
      reservations: "/api/reservations",
      products: "/api/products",
      chefs: "/api/chefs",
      blogs: "/api/blogs",
      gallery: "/api/gallery",
      messages: "/api/messages",
      partners: "/api/partners",
      testimonials: "/api/testimonials",
      services: "/api/services",
      settings: "/api/settings",
      dashboard: "/api/dashboard",
      health: "/api/health",
    },
  });
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database THEN start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("=".repeat(60));
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log("\n📚 Available Endpoints:");
      console.log(`   🔑 Auth:          /api/auth`);
      console.log(`   👤 Customers:     /api/customers`);
      console.log(`   🛒 Orders:        /api/orders`);
      console.log(`   📅 Reservations:  /api/reservations`);
      console.log(`   🍔 Products:      /api/products`);
      console.log(`   👨‍🍳 Chefs:         /api/chefs`);
      console.log(`   📰 Blogs:         /api/blogs`);
      console.log(`   🖼️  Gallery:       /api/gallery`);
      console.log(`   💬 Messages:      /api/messages`);
      console.log(`   🤝 Partners:      /api/partners`);
      console.log(`   ⭐ Testimonials:  /api/testimonials`);
      console.log(`   🛎️  Services:      /api/services`);
      console.log(`   ⚙️  Settings:      /api/settings`);
      console.log(`   📊 Dashboard:     /api/dashboard`);
      console.log("=".repeat(60) + "\n");
    });
  })
  .catch((err) => {
    console.error("\n❌ Failed to connect to database:", err.message);
    process.exit(1);
  });
