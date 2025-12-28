import express from "express"
import authMiddleware from "../middleware/authMiddleware.js"
import {
  initiateEsewaPayment,
  verifyEsewaPayment,
  simulateEsewaPayment,
  handleEsewaSuccess,
  handleEsewaFailure,
} from "../controllers/esewaController.js"

const router = express.Router()

// Test endpoint to verify routes are working
router.get("/test", (req, res) => {
  res.json({ message: "eSewa routes are working!", timestamp: new Date().toISOString() })
})

// Initiate eSewa payment
router.post("/initiate", authMiddleware, initiateEsewaPayment)

// Verify eSewa payment
router.post("/verify", authMiddleware, verifyEsewaPayment)

// Simulate eSewa payment (development only)
router.post("/simulate", authMiddleware, simulateEsewaPayment)

// eSewa success callback
router.get("/success", handleEsewaSuccess)

// eSewa failure callback
router.get("/failure", handleEsewaFailure)

export default router