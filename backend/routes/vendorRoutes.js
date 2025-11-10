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
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Public routes
router.get("/", getAllVendors)
router.get("/services", getVendorServices)
router.get("/locations", getVendorLocations)

// Protected routes - put /me before /:id to avoid conflicts
router.get("/me", authMiddleware, getVendorProfile)
router.post("/", authMiddleware, createVendorProfile)
router.put("/profile", authMiddleware, updateVendorProfile)

// Public route with parameter (must be last)
router.get("/user/:userId", getVendorByUserId)
router.get("/:id", getVendorById)

export default router
