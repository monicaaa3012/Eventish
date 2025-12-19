import express from "express"
import { getRecommendations, getJaccardRecommendations } from "../controllers/recommendationController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

// GET /api/recommendations/latest - Legacy endpoint
router.get("/latest", protect, getRecommendations)

// GET /api/recommendations/jaccard - New Jaccard similarity endpoint (backward compatibility)
router.get("/jaccard", protect, getJaccardRecommendations)

// POST /api/recommendations/jaccard - Enhanced Jaccard similarity with event selection
router.post("/jaccard", protect, getJaccardRecommendations)

export default router
