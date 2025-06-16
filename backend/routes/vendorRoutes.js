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

// Protected routes (put these BEFORE the /:id route)
router.post("/", authMiddleware, createVendorProfile)
router.get("/me", authMiddleware, getVendorProfile) // ✅ for GET vendor profile by logged-in user
router.put("/profile", authMiddleware, updateVendorProfile) // ✅ for updating vendor profile

// Public route with ID parameter (put this LAST)
router.get("/:id", getVendorById)

module.exports = router
