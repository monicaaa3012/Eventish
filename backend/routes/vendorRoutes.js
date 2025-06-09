const express = require("express")
const router = express.Router()
const {
  createVendorProfile,
  getAllVendors,
  getVendorById,
  updateVendorProfile,
  getVendorServices,
  getVendorLocations,
} = require("../controllers/vendorController")
const authMiddleware = require("../middleware/authMiddleware")

// Public routes
router.get("/", getAllVendors)
router.get("/services", getVendorServices)
router.get("/locations", getVendorLocations)
router.get("/:id", getVendorById)

// Protected routes
router.post("/", authMiddleware, createVendorProfile)
router.put("/profile", authMiddleware, updateVendorProfile)

module.exports = router
