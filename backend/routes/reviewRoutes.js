import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import {
  getVendorReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js"

const router = express.Router()

// Get reviews for a specific vendor (public)
router.get("/vendor/:vendorId", getVendorReviews)

// Get my reviews (vendor only)
router.get("/my-reviews", authMiddleware, getMyReviews)

// Create a review (authenticated users)
router.post("/", authMiddleware, createReview)

// Update a review (review owner only)
router.put("/:reviewId", authMiddleware, updateReview)

// Delete a review (review owner only)
router.delete("/:reviewId", authMiddleware, deleteReview)

export default router