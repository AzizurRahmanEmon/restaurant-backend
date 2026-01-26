// src/models/BlogComment.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IBlogComment extends Document {
  blogId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  comment: string;
  avatar?: string;
  isApproved: boolean;
  likes: number;
  parentComment?: mongoose.Types.ObjectId; // For replies
  createdAt: Date;
  updatedAt: Date;
}

const BlogCommentSchema = new Schema<IBlogComment>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: [true, "Blog ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    avatar: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve, or set to false for moderation
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "BlogComment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
BlogCommentSchema.index({ blogId: 1, createdAt: -1 });
BlogCommentSchema.index({ isApproved: 1 });
BlogCommentSchema.index({ parentComment: 1 });

export default mongoose.model<IBlogComment>("BlogComment", BlogCommentSchema);
