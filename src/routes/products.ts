import express, { Request, Response } from "express";
import Product from "../models/Product";
import { protect } from "../middleware/auth";
import { AuthRequest } from "../types";
import {
  validateProductCreate,
  validateProductUpdate,
  validateStockUpdate,
  validateIdParam,
  validatePagination,
  validateSearchQuery,
  validateSortParam,
  validatePriceRange,
  validateTagsQuery,
  validateParamSafety,
} from "../middleware/validation";
import {
  buildProductQuery,
  buildSortOption,
} from "../utils/productQueryBuilder";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get(
  "/",
  validatePagination,
  validateSearchQuery,
  validateSortParam,
  validatePriceRange,
  validateTagsQuery,
  async (req: Request, res: Response) => {
    try {
      const {
        category,
        isActive,
        isFeatured,
        minPrice,
        maxPrice,
        tags,
        search,
        sort,
        page = 1,
        limit = 12,
      } = req.query;

      // Validation for category length
      if (category && (category as string).length > 50) {
        return res.status(400).json({
          success: false,
          message: "Category parameter too long",
        });
      }

      // Build query using utility function
      const query = buildProductQuery({
        category: category as string,
        isActive: isActive as string,
        isFeatured: isFeatured as string,
        minPrice: minPrice as string,
        maxPrice: maxPrice as string,
        tags: tags as string,
        search: search as string,
      });

      // Build sort option using utility function
      const sortOption = buildSortOption({ sort: sort as string });

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

      const total = await Product.countDocuments(query);

      res.json({
        success: true,
        count: products.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: products,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   GET /api/products/featured
// @desc    Get featured products grouped by category (for menu page)
// @access  Public
router.get("/featured", async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    }).sort({
      category: 1,
      createdAt: -1,
    });

    // Group by category
    const groupedProducts = products.reduce((acc: any, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedProducts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get(
  "/category/:category",
  validateParamSafety("category"),
  async (req: Request, res: Response) => {
    try {
      const products = await Product.find({
        category: req.params.category,
        isActive: true,
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   GET /api/products/stats
// @desc    Get product statistics
// @access  Private
router.get("/stats", protect, async (_req: AuthRequest, res: Response) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    const outOfStock = await Product.countDocuments({ stock: 0 });

    // Count by category
    const categoryCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        total: totalProducts,
        active: activeProducts,
        featured: featuredProducts,
        outOfStock,
        byCategory: categoryCounts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/products/:slug
// @desc    Get single product by slug
// @access  Public
router.get(
  "/:slug",
  validateParamSafety("slug"),
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findOne({ slug: req.params.slug });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   POST /api/products
// @desc    Create product (Admin only)
// @access  Private
router.post(
  "/",
  protect,
  validateProductCreate,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private
router.put(
  "/:id",
  protect,
  validateIdParam,
  validateProductUpdate,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   PATCH /api/products/:id/featured
// @desc    Toggle featured status
// @access  Private
router.patch(
  "/:id/featured",
  protect,
  validateIdParam,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // If trying to unfeature, check if it's the last featured item in category
      if (product.isFeatured) {
        const featuredCount = await Product.countDocuments({
          category: product.category,
          isFeatured: true,
        });

        if (featuredCount <= 1) {
          return res.status(400).json({
            success: false,
            message: `Cannot unfeature. Category '${product.category}' must have at least 1 featured product.`,
          });
        }
      }

      product.isFeatured = !product.isFeatured;
      await product.save();

      res.json({
        success: true,
        message: `Product is now ${
          product.isFeatured ? "featured" : "not featured"
        }`,
        data: product,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Private
router.patch(
  "/:id/stock",
  protect,
  validateIdParam,
  validateStockUpdate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { stock } = req.body;

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stock },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message: "Stock updated successfully",
        data: product,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete - set inactive)
// @access  Private
router.delete(
  "/:id",
  protect,
  validateIdParam,
  async (req: AuthRequest, res: Response) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Permanent delete
      await Product.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Product deleted permanently",
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
