// src/models/Testimonial.ts - FIXED

import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  testimony: string;
  img: string;
  name: string;
  position: string;
  rating?: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdBy?: mongoose.Types.ObjectId; // Made optional for public submissions
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    testimony: {
      type: String,
      required: [true, "Testimony is required"],
      trim: true,
      minlength: [10, "Testimony must be at least 10 characters"],
      maxlength: [1000, "Testimony must not exceed 1000 characters"],
    },
    img: {
      type: String,
      required: [true, "Image is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      minlength: [2, "Position must be at least 2 characters"],
      maxlength: [100, "Position must not exceed 100 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must not exceed 5"],
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: false, // Start inactive for admin approval
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional for public submissions
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
TestimonialSchema.index({ isActive: 1 });
TestimonialSchema.index({ isFeatured: 1 });
TestimonialSchema.index({ displayOrder: 1 });
TestimonialSchema.index({ createdAt: -1 });

export default mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
