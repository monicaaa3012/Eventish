const express = require("express")
const router = express.Router()
const {
  createVendorProfile,
  getAllVendors,
  getVendorById,
  getVendorProfile,
  updateVendorProfile,
  getVendorServices,
  getVendorLocations,
} = require("../controllers/vendorController")
const authMiddleware = require("../middleware/authMiddleware")

// Public routes
router.get("/", getAllVendors)
router.get("/services", getVendorServices)
router.get("/locations", getVendorLocations)

// Protected routes - put /me before /:id to avoid conflicts
router.get("/me", authMiddleware, getVendorProfile)
router.post("/", authMiddleware, createVendorProfile)
router.put("/profile", authMiddleware, updateVendorProfile)

// Public route with parameter (must be last)
router.get("/:id", getVendorById)

module.exports = router
