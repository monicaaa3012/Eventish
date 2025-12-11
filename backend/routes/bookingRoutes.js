import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import {
  createBooking,
  getCustomerBookings,
  getCurrentVendorBookings,
  getVendorBookings,
  updateBookingStatus,
  confirmVendorWithPayment,
  getAllBookings,
} from "../controllers/bookingController.js"

const router = express.Router()

// Create booking
router.post("/", authMiddleware, createBooking)

// Get customer bookings
router.get("/customer", authMiddleware, getCustomerBookings)

// Get vendor bookings (using current user's vendor profile)
router.get("/vendor", authMiddleware, getCurrentVendorBookings)

// Get vendor bookings by vendor ID
router.get("/vendor/:vendorId", authMiddleware, getVendorBookings)

// Update booking status
router.put("/:id/status", authMiddleware, updateBookingStatus)

// Confirm vendor with payment
router.put("/:id/confirm-vendor", authMiddleware, confirmVendorWithPayment)

// Get all bookings (admin)
router.get("/all", authMiddleware, getAllBookings)

export default router
