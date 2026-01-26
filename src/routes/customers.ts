import express, { Request, Response } from "express";
import Customer from "../models/Customer";
import { protect } from "../middleware/auth";
import { AuthRequest } from "../types";
import {
  validateCustomerCreate,
  validateCustomerUpdate,
  validateIdParam,
  validatePagination,
  validateSearchQuery,
  validateLoyaltyPointsUpdate,
  validateCustomerLogin,
} from "../middleware/validation";

const router = express.Router();

// @route   GET /api/customers
// @desc    Get all customers (Admin only)
// @access  Private
router.get("/", protect, validatePagination, validateSearchQuery, async (req: AuthRequest, res: Response) => {
  try {
    const { search, isActive, page = 1, limit = 50 } = req.query;

    let query: any = {};

    // Search by name, email, or phone (already sanitized by validateSearchQuery)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const customers = await Customer.find(query)
        .populate("orderHistory")
        .sort({ createdAt: -1 })
        .select("-password")
        .skip(skip)
        .limit(limitNum);

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      count: customers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: customers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/customers/stats
// @desc    Get customer statistics
// @access  Private
router.get("/stats", protect, async (req: AuthRequest, res: Response) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    const inactiveCustomers = await Customer.countDocuments({
      isActive: false,
    });

    // Get top customers by loyalty points
    const topCustomers = await Customer.find()
        .sort({ loyaltyPoints: -1 })
        .limit(5)
        .select("name email loyaltyPoints orderHistory");

    res.json({
      success: true,
      data: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
        topCustomers,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private
router.get(
    "/:id",
    protect,
    validateIdParam,
    async (req: AuthRequest, res: Response) => {
      try {
        const customer = await Customer.findById(req.params.id)
            .populate("orderHistory")
            .select("-password");

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: "Customer not found",
          });
        }

        res.json({
          success: true,
          data: customer,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
);

// @route   POST /api/customers
// @desc    Create customer (Public - for customer registration)
// @access  Public
router.post(
    "/",
    validateCustomerCreate,
    async (req: Request, res: Response) => {
      try {
        const { email, phone } = req.body;

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
          $or: [{ email }, { phone }],
        });

        if (existingCustomer) {
          return res.status(400).json({
            success: false,
            message: "Customer with this email or phone already exists",
          });
        }

        const customer = new Customer(req.body);
        await customer.save();

        // Remove password from response
        const customerResponse = await Customer.findById(customer._id)
            .select("-password")
            .lean();

        res.status(201).json({
          success: true,
          message: "Customer registered successfully",
          data: customerResponse,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }
);

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put(
    "/:id",
    protect,
    validateIdParam,
    validateCustomerUpdate,
    async (req: AuthRequest, res: Response) => {
      try {
        // Don't allow updating password through this route
        delete req.body.password;

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
              new: true,
              runValidators: true,
            }
        ).select("-password");

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: "Customer not found",
          });
        }

        res.json({
          success: true,
          message: "Customer updated successfully",
          data: customer,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }
);

// @route   DELETE /api/customers/:id
// @desc    Delete customer (soft delete - set inactive)
// @access  Private
router.delete(
    "/:id",
    protect,
    validateIdParam,
    async (req: AuthRequest, res: Response) => {
      try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: "Customer not found",
          });
        }

        // Soft delete - just set to inactive
        customer.isActive = false;
        await customer.save();

        res.json({
          success: true,
          message: "Customer deactivated successfully",
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
);

// @route   PATCH /api/customers/:id/activate
// @desc    Reactivate customer
// @access  Private
router.patch(
    "/:id/activate",
    protect,
    validateIdParam,
    async (req: AuthRequest, res: Response) => {
      try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: "Customer not found",
          });
        }

        customer.isActive = true;
        await customer.save();

        res.json({
          success: true,
          message: "Customer activated successfully",
          data: customer,
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    }
);

// @route   PATCH /api/customers/:id/loyalty-points
// @desc    Update customer loyalty points
// @access  Private
router.patch(
    "/:id/loyalty-points",
    protect,
    validateIdParam,
    validateLoyaltyPointsUpdate,
    async (req: AuthRequest, res: Response) => {
      try {
        const { points, action } = req.body;

        const pointsNum = Number(points);

        const customer = await Customer.findById(req.params.id);

        if (!customer) {
          return res.status(404).json({
            success: false,
            message: "Customer not found",
          });
        }

        if (action === "add") {
          customer.loyaltyPoints += pointsNum;
        } else if (action === "subtract") {
          customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsNum);
        }

        await customer.save();

        res.json({
          success: true,
          message: `${
              action === "add" ? "Added" : "Subtracted"
          } ${pointsNum} loyalty points`,
          data: {
            loyaltyPoints: customer.loyaltyPoints,
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

// @route   POST /api/customers/login
// @desc    Customer login
// @access  Public
router.post("/login", validateCustomerLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find customer with password (email already sanitized by validator)
    const customer = await Customer.findOne({
      email,
      isActive: true,
    }).select("+password");

    if (!customer || !customer.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await customer.comparePassword!(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Remove password from response
    const customerResponse = customer.toObject();
    delete customerResponse.password;

    res.json({
      success: true,
      message: "Login successful",
      data: customerResponse,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;