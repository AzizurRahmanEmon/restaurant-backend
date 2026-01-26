// ============================================
// VALIDATION INDEX - Central export file
// src/middleware/validation/index.ts
// ============================================

// Common validators (shared across all routes)
export * from "./common";

// Feature-specific validators
export * from "./auth.validation";
export * from "./blog.validation";
export * from "./chef.validation";
export * from "./customer.validation";
export * from "./gallery.validation";
export * from "./message.validation";
export * from "./order.validation";
export * from "./partner.validation";
export * from "./product.validation";
export * from "./reservation.validation";
export * from "./service.validation";
export * from "./settings.validation";
export * from "./testimonial.validation";
export * from "./comment.validation";

// ============================================
// USAGE IN ROUTE FILES:
// ============================================
// Before: import { validateBlogCreate } from '../middleware/validation';
// After:  import { validateBlogCreate } from '../middleware/validation';
//
// No changes needed in route files!
// Just reorganize the validation.ts file into separate files
// ============================================
