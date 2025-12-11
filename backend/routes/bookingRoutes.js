import express from "express"
import protect from "../middleware/authMiddleware.js"
import {
  createBooking,
  getCustomerBookings,
  getCurrentVendorBookings,
  getVendorBookings,
  updateBookingStatus,
  getAllBookings,
  getBookingById,
  addBookingReview,
} from "../controllers/bookingController.js"

const router = express.Router()

// Create booking
router.post("/", protect, createBooking)

// Get customer bookings
router.get("/customer", protect, getCustomerBookings)

// Get vendor bookings (using current user's vendor profile)
router.get("/vendor", protect, getCurrentVendorBookings)

// Get vendor bookings by vendor ID
router.get("/vendor/:vendorId", protect, getVendorBookings)

// Update booking status
router.put("/:id/status", protect, updateBookingStatus)

// Get all bookings (admin)
router.get("/all", protect, getAllBookings)

// Get single booking by ID
router.get("/:id", protect, getBookingById)

// Add review to a booking
router.post("/:id/review", protect, addBookingReview)

export default router
