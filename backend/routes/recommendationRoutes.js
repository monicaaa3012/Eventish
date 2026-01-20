import express from "express"
import { 
  getRecommendations, 
  getJaccardRecommendations, 
  toggleWishlist,
  getWishlist 
} from "../controllers/recommendationController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

// --- Recommendation Endpoints ---

// GET /api/recommendations/latest - Legacy endpoint
router.get("/latest", protect, getRecommendations)

// GET /api/recommendations/jaccard - New Jaccard similarity endpoint
router.get("/jaccard", protect, getJaccardRecommendations)

// POST /api/recommendations/jaccard - Enhanced Jaccard similarity with event selection
router.post("/jaccard", protect, getJaccardRecommendations)

// --- Wishlist / Saved Recommendations Endpoints ---

// POST /api/recommendations/wishlist/:vendorId - Toggle save/unsave a vendor
router.post("/wishlist/:vendorId", protect, toggleWishlist)

// GET /api/recommendations/wishlist - Fetch all saved vendors for the current user
router.get("/wishlist", protect, getWishlist)

export default router