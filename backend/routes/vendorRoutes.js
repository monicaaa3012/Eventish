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
  verifyVendor,
  featureVendor,
  getPendingVendors,
} from "../controllers/vendorController.js"
import { getMyReviews, getVendorReviews } from "../controllers/reviewController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", getAllVendors)
router.get("/services", getVendorServices)
router.get("/locations", getVendorLocations)


// Protected routes - put /me before /:id to avoid conflicts
router.get("/me", protect, getVendorProfile)
router.get("/my-reviews", protect, getMyReviews)
router.post("/", protect, createVendorProfile)
router.put("/profile", protect, updateVendorProfile)

// Admin routes
router.put("/admin/verify/:id", protect, verifyVendor)
router.put("/admin/feature/:id", protect, featureVendor)
router.get("/admin/pending", protect, getPendingVendors)

// Public route with parameter (must be last)
router.get("/user/:userId", getVendorByUserId)
router.get("/:id/reviews", getVendorReviews)
router.get("/:id", getVendorById)

export default router
