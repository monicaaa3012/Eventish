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
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Find vendor by userId
    const vendor = await Vendor.findOne({ userId })
      .populate('reviews.user', 'name email')
      .select('reviews rating reviewCount businessName')
    
    if (!vendor) {
      // Return empty reviews if vendor profile doesn't exist yet
      return res.json({
        reviews: [],
        rating: 0,
        reviewCount: 0,
        businessName: ""
      })
    }

    res.json({
      reviews: vendor.reviews || [],
      rating: vendor.rating || 0,
      reviewCount: vendor.reviewCount || 0,
      businessName: vendor.businessName
    })
  } catch (error) {
    console.error("Error fetching vendor reviews:", error)
    res.status(500).json({ message: "Error fetching reviews", error: error.message })
  }
}

// Add a review to a vendor (this is now handled in bookingController.js for booking-based reviews)