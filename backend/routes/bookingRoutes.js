const express = require("express")
const router = express.Router()
const {
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  updateBookingStatus,
} = require("../controllers/bookingController")
const authMiddleware = require("../middleware/authMiddleware")

// All routes require authentication
router.use(authMiddleware)

router.post("/", createBooking)
router.get("/customer", getCustomerBookings)
router.get("/vendor", getVendorBookings)
router.put("/:id/status", updateBookingStatus)

module.exports = router
