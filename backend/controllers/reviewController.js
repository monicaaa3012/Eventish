import Vendor from "../models/Vendor.js"

// Get all reviews for a specific vendor (public route)
export const getVendorReviews = async (req, res) => {
  try {
    const vendorId = req.params.id
    
    const vendor = await Vendor.findById(vendorId)
      .populate('reviews.user', 'name email')
      .select('reviews rating reviewCount')
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }

    res.json({
      reviews: vendor.reviews,
      rating: vendor.rating,
      reviewCount: vendor.reviewCount
    })
  } catch (error) {
    console.error("Error fetching vendor reviews:", error)
    res.status(500).json({ message: "Error fetching reviews", error: error.message })
  }
}

// Get reviews for logged-in vendor (their own reviews)
export const getMyVendorReviews = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Find vendor by userId
    const vendor = await Vendor.findOne({ userId })
      .populate('reviews.user', 'name email')
      .select('reviews rating reviewCount businessName')
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" })
    }

    res.json({
      reviews: vendor.reviews,
      rating: vendor.rating,
      reviewCount: vendor.reviewCount,
      businessName: vendor.businessName
    })
  } catch (error) {
    console.error("Error fetching vendor reviews:", error)
    res.status(500).json({ message: "Error fetching reviews", error: error.message })
  }
}

// Add a review to a vendor
export const addVendorReview = async (req, res) => {
  try {
    const vendorId = req.params.id
    const { rating, comment } = req.body
    const userId = req.user.id

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" })
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: "Comment is required" })
    }

    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }

    // Check if user already reviewed this vendor
    const existingReview = vendor.reviews.find(
      review => review.user.toString() === userId
    )

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this vendor" })
    }

    // Add new review
    const newReview = {
      user: userId,
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date()
    }

    vendor.reviews.push(newReview)

    // Recalculate average rating
    const totalRating = vendor.reviews.reduce((sum, review) => sum + review.rating, 0)
    vendor.rating = totalRating / vendor.reviews.length
    vendor.reviewCount = vendor.reviews.length

    await vendor.save()

    // Populate the new review with user info for response
    await vendor.populate('reviews.user', 'name email')
    
    res.status(201).json({ 
      message: "Review added successfully",
      review: vendor.reviews[vendor.reviews.length - 1],
      newRating: vendor.rating,
      reviewCount: vendor.reviewCount
    })
  } catch (error) {
    console.error("Error adding review:", error)
    res.status(500).json({ message: "Error adding review", error: error.message })
  }
}