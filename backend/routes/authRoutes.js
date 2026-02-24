import express from "express"
import { register, login, getProfile, addToWishlist, removeFromWishlist, getWishlist } from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", protect, getProfile)
router.post("/wishlist", protect, addToWishlist)
router.delete("/wishlist/:vendorId", protect, removeFromWishlist)
router.get("/wishlist", protect, getWishlist)

export default router
