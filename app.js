import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import {
  DATABASE,
  MAX_JSON_SIZE,
  PORT,
  REQUEST_NUMBER,
  REQUEST_TIME,
  URL_ENCODE,
  WEB_CACHE,
} from "./app/config/config.js";

import router from "./routes/api.js";

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and middleware configuration
app.use(cors());
app.use(express.json({ limit: MAX_JSON_SIZE }));
app.use(express.urlencoded({ extended: URL_ENCODE }));
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://azizur-rahman.netlify.app/"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Rate limiting
const limiter = rateLimit({
  windowMs: REQUEST_TIME,
  max: REQUEST_NUMBER,
});
app.use(limiter);

// Static file serving
// app.use(express.static(path.join(__dirname, "admin-dashboard", "dist")));

// Cache configuration
app.set("etag", WEB_CACHE);

// Database connection with updated configuration
mongoose
  .connect(DATABASE, {
    autoIndex: true,
  })
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

// API routes
app.use("/api", router);

// Catch-all route for React Router
app.get("*", (req, res) => {
  // This is only needed for local development
  if (process.env.NODE_ENV === "development") {
    res.sendFile(path.join(__dirname, "admin-dashboard", "dist", "index.html"));
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port: ${PORT}`
  );
});

export default app;
