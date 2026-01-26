import express from "express";
const router = express.Router();
import * as UserController from "../app/controllers/UserController.js";
import * as BlogController from "../app/controllers/BlogController.js";
import * as ServiceController from "../app/controllers/ServiceController.js";
import * as FaqController from "../app/controllers/FaqController.js";
import * as TestimonyController from "../app/controllers/TestimonyController.js";
import * as SkillController from "../app/controllers/SkillController.js";
import * as PortfolioController from "../app/controllers/PortfolioController.js";
import * as PricingController from "../app/controllers/PricingController.js";
import * as EducationController from "../app/controllers/EducationController.js";
import * as ExperienceController from "../app/controllers/ExperienceController.js";

import AuthMiddleware from "../app/middlewares/AuthMiddleware.js";

// Users
router.post("/Registration", UserController.Registration);
router.post("/Login", UserController.Login);
router.get("/ProfileDetails", AuthMiddleware, UserController.ProfileDetails);
router.post("/ProfileUpdate", AuthMiddleware, UserController.ProfileUpdate);

router.get("/EmailVerify/:email", UserController.EmailVerify);
router.get("/CodeVerify/:email/:code", UserController.CodeVerify);
router.post("/ResetPassword", UserController.ResetPassword);

// Blog
router.post("/createBlog", AuthMiddleware, BlogController.createBlog);
router.get("/allBlogs", BlogController.allBlogList);
router.put("/updateBlog/:id", AuthMiddleware, BlogController.updateSingleBlog);
router.delete(
  "/deleteBlog/:id",
  AuthMiddleware,
  BlogController.deleteSingleBlog
);

// Service
router.post("/createService", AuthMiddleware, ServiceController.createService);
router.get("/allServices", ServiceController.allServiceList);
router.put(
  "/updateService/:id",
  AuthMiddleware,
  ServiceController.updateSingleService
);
router.delete(
  "/deleteService/:id",
  AuthMiddleware,
  ServiceController.deleteSingleService
);

// FAQ Routes
router.post("/createFaq", AuthMiddleware, FaqController.createFaq);
router.get("/allFaqs", FaqController.allFaqList);
router.put("/updateFaq/:id", AuthMiddleware, FaqController.updateSingleFaq);
router.delete("/deleteFaq/:id", AuthMiddleware, FaqController.deleteSingleFaq);

// Testimony Routes
router.post(
  "/createTestimony",
  AuthMiddleware,
  TestimonyController.createTestimony
);
router.get("/allTestimonies", TestimonyController.allTestimonyList);
router.put(
  "/updateTestimony/:id",
  AuthMiddleware,
  TestimonyController.updateSingleTestimony
);
router.delete(
  "/deleteTestimony/:id",
  AuthMiddleware,
  TestimonyController.deleteSingleTestimony
);

// Skill Routes
router.post("/createSkill", AuthMiddleware, SkillController.createSkill);
router.get("/allSkills", SkillController.allSkillList);
router.put(
  "/updateSkill/:id",
  AuthMiddleware,
  SkillController.updateSingleSkill
);
router.delete(
  "/deleteSkill/:id",
  AuthMiddleware,
  SkillController.deleteSingleSkill
);

// Portfolio Routes
router.post(
  "/createPortfolio",
  AuthMiddleware,
  PortfolioController.createPortfolio
);
router.get("/allPortfolios", PortfolioController.allPortfolioList);
router.put(
  "/updatePortfolio/:id",
  AuthMiddleware,
  PortfolioController.updateSinglePortfolio
);
router.delete(
  "/deletePortfolio/:id",
  AuthMiddleware,
  PortfolioController.deleteSinglePortfolio
);

// Pricing Routes
router.post("/createPricing", AuthMiddleware, PricingController.createPricing);
router.get("/allPricing", PricingController.allPricingList);
router.put(
  "/updatePricing/:id",
  AuthMiddleware,
  PricingController.updateSinglePricing
);
router.delete(
  "/deletePricing/:id",
  AuthMiddleware,
  PricingController.deleteSinglePricing
);

// Education Routes
router.post(
  "/createEducation",
  AuthMiddleware,
  EducationController.createEducation
);
router.get("/allEducations", EducationController.allEducationList);
router.put(
  "/updateEducation/:id",
  AuthMiddleware,
  EducationController.updateSingleEducation
);
router.delete(
  "/deleteEducation/:id",
  AuthMiddleware,
  EducationController.deleteSingleEducation
);

// Experience Routes
router.post(
  "/createExperience",
  AuthMiddleware,
  ExperienceController.createExperience
);
router.get("/allExperiences", ExperienceController.allExperienceList);
router.put(
  "/updateExperience/:id",
  AuthMiddleware,
  ExperienceController.updateSingleExperience
);
router.delete(
  "/deleteExperience/:id",
  AuthMiddleware,
  ExperienceController.deleteSingleExperience
);

export default router;
