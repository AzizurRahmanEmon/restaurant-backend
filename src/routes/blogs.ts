import express, { Request, Response } from "express";
import Blog from "../models/Blog";
import BlogComment from "../models/BlogComment";
import { protect } from "../middleware/auth";
import { AuthRequest } from "../types";
import {
  validateBlogCreate,
  validateBlogUpdate,
  validateIdParam,
  validatePagination,
  validateSearchQuery,
  validateParamSafety,
  validateCommentCreate,
  validateCommentLike,
  validateCommentApproval,
} from "../middleware/validation";

const router = express.Router();

// @route GET /api/blogs
// @desc Get all blogs with filters
// @access Public
router.get(
  "/",
  validatePagination,
  validateSearchQuery,
  async (req: Request, res: Response) => {
    try {
      const {
        status,
        category,
        isFeatured,
        tag,
        search,
        sort,
        page = 1,
        limit = 10,
      } = req.query;

      let query: any = {};

      // Filter by status
      if (status) query.status = status;

      // Filter by category
      if (category) query.category = category;

      // Filter by featured
      if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";

      // Filter by tag
      if (tag) query.tags = tag;

      // Search by title or content
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }

      // Sorting
      let sortOption: any = { date: -1, createdAt: -1 };
      if (sort === "date-asc") sortOption = { date: 1 };
      if (sort === "date-desc") sortOption = { date: -1 };
      if (sort === "title") sortOption = { title: 1 };
      if (sort === "views") sortOption = { views: -1 };
      if (sort === "likes") sortOption = { likes: -1 };

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const blogs = await Blog.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate("author", "name email");

      const total = await Blog.countDocuments(query);

      res.json({
        success: true,
        count: blogs.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: blogs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route GET /api/blogs/featured
// @desc Get featured blogs
// @access Public
router.get(
  "/featured",
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      const blogs = await Blog.find({
        isFeatured: true,
        status: "published",
      })
        .sort({ date: -1 })
        .limit(limit)
        .populate("author", "name email");

      res.json({
        success: true,
        count: blogs.length,
        data: blogs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route GET /api/blogs/category/:category
// @desc Get blogs by category
// @access Public
router.get(
  "/category/:category",
  validateParamSafety("category"),
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const blogs = await Blog.find({
        category: req.params.category,
        status: "published",
      })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("author", "name email");

      const total = await Blog.countDocuments({
        category: req.params.category,
        status: "published",
      });

      res.json({
        success: true,
        count: blogs.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: blogs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route GET /api/blogs/tag/:tag
// @desc Get blogs by tag
// @access Public
router.get(
  "/tag/:tag",
  validateParamSafety("tag"),
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const blogs = await Blog.find({
        tags: req.params.tag,
        status: "published",
      })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("author", "name email");

      const total = await Blog.countDocuments({
        tags: req.params.tag,
        status: "published",
      });

      res.json({
        success: true,
        count: blogs.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: blogs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route GET /api/blogs/link/:link
// @desc Get blog by link
// @access Public
router.get(
  "/link/:link",
  validateParamSafety("link"),
  async (req: Request, res: Response) => {
    try {
      const blog = await Blog.findOne({ link: req.params.link }).populate(
        "author",
        "name email"
      );

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Increment views
      blog.views += 1;
      await blog.save();

      res.json({
        success: true,
        data: blog,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route GET /api/blogs/:id
// @desc Get single blog by ID
// @access Public
router.get("/:id", validateIdParam, async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route POST /api/blogs
// @desc Create blog (Admin only)
// @access Private
router.post(
  "/",
  protect,
  validateBlogCreate,
  async (req: AuthRequest, res: Response) => {
    try {
      const blogData = {
        ...req.body,
        author: req.user?.id,
      };

      const blog = await Blog.create(blogData);

      res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Blog link already exists",
        });
      }

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route PUT /api/blogs/:id
// @desc Update blog (Admin only)
// @access Private
router.put(
  "/:id",
  protect,
  validateIdParam,
  validateBlogUpdate,
  async (req: AuthRequest, res: Response) => {
    try {
      const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      res.json({
        success: true,
        message: "Blog updated successfully",
        data: blog,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Blog link already exists",
        });
      }

      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route PATCH /api/blogs/:id/like
// @desc Like a blog
// @access Public
router.patch(
  "/:id/like",
  validateIdParam,
  async (req: Request, res: Response) => {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      blog.likes += 1;
      await blog.save();

      res.json({
        success: true,
        message: "Blog liked successfully",
        data: { likes: blog.likes },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route PATCH /api/blogs/:id/featured
// @desc Toggle featured status
// @access Private
router.patch(
  "/:id/featured",
  protect,
  validateIdParam,
  async (req: AuthRequest, res: Response) => {
    try {
      const blog = await Blog.findById(req.params.id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      blog.isFeatured = !blog.isFeatured;
      await blog.save();

      res.json({
        success: true,
        message: `Blog is now ${blog.isFeatured ? "featured" : "not featured"}`,
        data: blog,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route DELETE /api/blogs/:id
// @desc Delete blog (Admin only)
// @access Private
router.delete(
  "/:id",
  protect,
  validateIdParam,
  async (req: AuthRequest, res: Response) => {
    try {
      const blog = await Blog.findByIdAndDelete(req.params.id);

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      res.json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ============================================
// COMMENT ROUTES - Add these to your existing blog routes
// ============================================

// @route   GET /api/blogs/:blogId/comments
// @desc    Get all comments for a specific blog
// @access  Public
router.get(
  "/:blogId/comments",
  validateIdParam,
  validatePagination,
  async (req: Request, res: Response) => {
    try {
      const { blogId } = req.params;
      const { page = 1, limit = 20, sort = "newest" } = req.query;

      // Check if blog exists
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Build query - only show approved comments to public
      const query: any = {
        blogId,
        isApproved: true,
        parentComment: null, // Only top-level comments
      };

      // Sorting
      let sortOption: any = { createdAt: -1 }; // Default: newest first
      if (sort === "oldest") sortOption = { createdAt: 1 };
      if (sort === "likes") sortOption = { likes: -1, createdAt: -1 };

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const comments = await BlogComment.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await BlogComment.countDocuments(query);

      res.json({
        success: true,
        count: comments.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: comments,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   POST /api/blogs/:blogId/comments
// @desc    Add a comment to a blog
// @access  Public
router.post(
  "/:blogId/comments",
  validateIdParam,
  validateCommentCreate,
  async (req: Request, res: Response) => {
    try {
      const { blogId } = req.params;
      const { name, email, comment, avatar, parentComment } = req.body;

      // Check if blog exists
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Create comment
      const newComment = await BlogComment.create({
        blogId,
        name,
        email,
        comment,
        avatar: avatar || "",
        parentComment: parentComment || null,
        isApproved: true, // Auto-approve (set to false if you want moderation)
      });

      res.status(201).json({
        success: true,
        message: "Comment posted successfully",
        data: newComment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   GET /api/blogs/:blogId/comments/:commentId/replies
// @desc    Get replies for a specific comment
// @access  Public
router.get(
  "/:blogId/comments/:commentId/replies",
  validateIdParam,
  async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;

      const replies = await BlogComment.find({
        parentComment: commentId,
        isApproved: true,
      })
        .sort({ createdAt: 1 }) // Oldest first for replies
        .lean();

      res.json({
        success: true,
        count: replies.length,
        data: replies,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   PATCH /api/blogs/:blogId/comments/:commentId/like
// @desc    Like a comment
// @access  Public
router.patch(
  "/:blogId/comments/:commentId/like",
  validateCommentLike,
  async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;

      const comment = await BlogComment.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      comment.likes += 1;
      await comment.save();

      res.json({
        success: true,
        message: "Comment liked successfully",
        data: { likes: comment.likes },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   GET /api/blogs/:blogId/comments/stats
// @desc    Get comment statistics for a blog (Admin)
// @access  Private
router.get(
  "/:blogId/comments/stats",
  protect,
  validateIdParam,
  async (req: AuthRequest, res: Response) => {
    try {
      const { blogId } = req.params;

      const total = await BlogComment.countDocuments({ blogId });
      const approved = await BlogComment.countDocuments({
        blogId,
        isApproved: true,
      });
      const pending = await BlogComment.countDocuments({
        blogId,
        isApproved: false,
      });

      res.json({
        success: true,
        data: {
          total,
          approved,
          pending,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   PATCH /api/blogs/:blogId/comments/:commentId/approve
// @desc    Approve/Reject a comment (Admin only)
// @access  Private
router.patch(
  "/:blogId/comments/:commentId/approve",
  protect,
  validateCommentApproval,
  async (req: AuthRequest, res: Response) => {
    try {
      const { commentId } = req.params;
      const { isApproved } = req.body;

      const comment = await BlogComment.findByIdAndUpdate(
        commentId,
        { isApproved },
        { new: true }
      );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      res.json({
        success: true,
        message: `Comment ${isApproved ? "approved" : "rejected"} successfully`,
        data: comment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   DELETE /api/blogs/:blogId/comments/:commentId
// @desc    Delete a comment (Admin only)
// @access  Private
router.delete(
  "/:blogId/comments/:commentId",
  protect,
  async (req: AuthRequest, res: Response) => {
    try {
      const { commentId } = req.params;

      const comment = await BlogComment.findByIdAndDelete(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Also delete all replies to this comment
      await BlogComment.deleteMany({ parentComment: commentId });

      res.json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
