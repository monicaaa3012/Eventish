import express from "express"
import {
  createVendorProfile,
  getAllVendors,
  getVendorById,
  getVendorProfile,
  updateVendorProfile,
  getVendorServices,
  getVendorLocations,
  getVendorByUserId,
} from "../controllers/vendorController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", getAllVendors)
router.get("/services", getVendorServices)
router.get("/locations", getVendorLocations)

// Protected routes - put /me before /:id to avoid conflicts
router.get("/me", protect, getVendorProfile)
router.post("/", protect, createVendorProfile)
router.put("/profile", protect, updateVendorProfile)
router.get("/my-reviews", protect, getMyVendorReviews)

// Import review functions for vendor-specific routes
import { getVendorReviews, addVendorReview, getMyVendorReviews } from "../controllers/reviewController.js"

// Public route with parameter (must be last)
router.get("/user/:userId", getVendorByUserId)
router.get("/:id", getVendorById)

// Review routes for vendors
router.get("/:id/reviews", getVendorReviews)
router.post("/:id/reviews", protect, addVendorReview)

export default router
