// src/routes/testimonials.ts - FIXED

import express, { Request, Response } from "express";
import Testimonial from "../models/Testimonial";
import { protect } from "../middleware/auth";
import { AuthRequest } from "../types";
import {
  validateTestimonialCreate,
  validateTestimonialUpdate,
  validateIdParam,
} from "../middleware/validation";

const router = express.Router();

// @route   GET /api/testimonials
// @desc    Get all testimonials
// @access  Public
router.get("/", async (req: Request, res: Response) => {
  try {
    const { isActive, isFeatured } = req.query;

    let query: any = {};

    if (isActive !== undefined) {
      if (isActive !== "true" && isActive !== "false") {
        return res.status(400).json({
          success: false,
          message: 'isActive must be either "true" or "false"',
        });
      }
      query.isActive = isActive === "true";
    }

    if (isFeatured !== undefined) {
      if (isFeatured !== "true" && isFeatured !== "false") {
        return res.status(400).json({
          success: false,
          message: 'isFeatured must be either "true" or "false"',
        });
      }
      query.isFeatured = isFeatured === "true";
    }

    const testimonials = await Testimonial.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate("createdBy", "name email");

    res.json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/testimonials/:id
// @desc    Get single testimonial by ID
// @access  Public
router.get("/:id", validateIdParam, async (req: Request, res: Response) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json({
      success: true,
      data: testimonial,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/testimonials
// @desc    Create testimonial (Public - from customer website)
// @access  Public
router.post(
  "/",
  validateTestimonialCreate,
  async (req: Request, res: Response) => {
    try {
      // For public submissions, we don't have a createdBy user
      // You might want to create a default "system" user for this
      // For now, we'll make createdBy optional or use a default ID

      const testimonialData = {
        ...req.body,
        isActive: false, // Start as inactive for admin approval
        isFeatured: false,
        displayOrder: 0,
        // If you have a default system user, use its ID here
        // createdBy: SYSTEM_USER_ID,
        // Otherwise, you'll need to make createdBy optional in your model
      };

      const testimonial = await Testimonial.create(testimonialData);

      res.status(201).json({
        success: true,
        message: "Thank you for your testimonial! It will be reviewed shortly.",
        data: testimonial,
      });
    } catch (error: any) {
      console.error("Testimonial creation error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// @route   PUT /api/testimonials/:id
// @desc    Update testimonial (Admin only - for toggling featured/active)
// @access  Private
router.put(
  "/:id",
  protect,
  validateIdParam,
  validateTestimonialUpdate,
  async (req: AuthRequest, res: Response) => {
    try {
      const testimonial = await Testimonial.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: "Testimonial not found",
        });
      }

      res.json({
        success: true,
        message: "Testimonial updated successfully",
        data: testimonial,
      });
    } catch (error: any) {
      console.error("Testimonial update error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// @route   DELETE /api/testimonials/:id
// @desc    Delete testimonial (Admin only)
// @access  Private
router.delete(
  "/:id",
  protect,
  validateIdParam,
  async (req: AuthRequest, res: Response) => {
    try {
      const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: "Testimonial not found",
        });
      }

      res.json({
        success: true,
        message: "Testimonial deleted successfully",
      });
    } catch (error: any) {
      console.error("Testimonial deletion error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

export default router;
