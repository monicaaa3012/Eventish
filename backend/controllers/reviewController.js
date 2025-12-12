import Review from "../models/Review.js"
import Vendor from "../models/Vendor.js"

// Get reviews for a specific vendor
export const getVendorReviews = async (req, res) => {
  try {
    const { vendorId } = req.params
    const reviews = await Review.find({ vendor: vendorId })
      .populate("user", "name")
      .sort({ createdAt: -1 })

    res.json({ reviews })
  } catch (error) {
    console.error("Error fetching vendor reviews:", error)
    res.status(500).json({ message: "Error fetching reviews", error: error.message })
  }
}

// Get reviews for current vendor (my reviews)
export const getMyReviews = async (req, res) => {
  try {
    // Find vendor profile for current user
    const vendor = await Vendor.findOne({ userId: req.user.id })

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" })
    }

    const reviews = await Review.find({ vendor: vendor._id })
      .populate("user", "name")
      .sort({ createdAt: -1 })

    res.json({ reviews })
  } catch (error) {
    console.error("Error fetching my reviews:", error)
    res.status(500).json({ message: "Error fetching reviews", error: error.message })
  }
}

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { vendorId, rating, comment } = req.body

    // Check if vendor exists
    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }

    // Check if user already reviewed this vendor
    const existingReview = await Review.findOne({
      user: req.user.id,
      vendor: vendorId,
    })

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this vendor" })
    }

    const review = new Review({
      user: req.user.id,
      vendor: vendorId,
      rating,
      comment,
    })

    await review.save()

    const populatedReview = await Review.findById(review._id).populate("user", "name")

    res.status(201).json({
      message: "Review created successfully",
      review: populatedReview,
    })
  } catch (error) {
    console.error("Error creating review:", error)
    res.status(500).json({ message: "Error creating review", error: error.message })
  }
}

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params
    const { rating, comment } = req.body

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this review" })
    }

    review.rating = rating || review.rating
    review.comment = comment || review.comment

    await review.save()

    const populatedReview = await Review.findById(review._id).populate("user", "name")

    res.json({
      message: "Review updated successfully",
      review: populatedReview,
    })
  } catch (error) {
    console.error("Error updating review:", error)
    res.status(500).json({ message: "Error updating review", error: error.message })
  }
}

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params

    const review = await Review.findById(reviewId)

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this review" })
    }

    await Review.findByIdAndDelete(reviewId)

    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    res.status(500).json({ message: "Error deleting review", error: error.message })
  }
}