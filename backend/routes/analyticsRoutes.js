import express from "express"
import protect from "../middleware/authMiddleware.js"
import {
  getVendorAnalytics,
  getAnalyticsByDateRange
} from "../controllers/analyticsController.js"

const router = express.Router()

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Analytics routes are working!" })
})

// Get vendor analytics
router.get("/vendor", protect, getVendorAnalytics)

// Get analytics by date range
router.get("/vendor/date-range", protect, getAnalyticsByDateRange)

export default router