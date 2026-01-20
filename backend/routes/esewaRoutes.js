import express from "express"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

// Esewa payment success callback
router.get("/:bookingId/payment/esewa/success", async (req, res) => {
  try {
    const { bookingId } = req.params
    const { oid, amt, refId } = req.query

    console.log("Esewa payment success:", { bookingId, oid, amt, refId })

    // Here you would typically:
    // 1. Verify the payment with Esewa API
    // 2. Update the booking payment status in database
    // 3. Send confirmation emails, etc.

    // For now, let's just redirect to a success page
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success?bookingId=${bookingId}&status=success&refId=${refId}`)
  } catch (error) {
    console.error("Esewa payment success error:", error)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?error=processing_error`)
  }
})

// Esewa payment failure callback
router.get("/:bookingId/payment/esewa/failure", async (req, res) => {
  try {
    const { bookingId } = req.params
    const { pid } = req.query

    console.log("Esewa payment failure:", { bookingId, pid })

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?bookingId=${bookingId}&status=failed`)
  } catch (error) {
    console.error("Esewa payment failure error:", error)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failure?error=processing_error`)
  }
})

// Payment verification endpoint (optional - for additional security)
router.post("/:bookingId/verify", protect, async (req, res) => {
  try {
    const { bookingId } = req.params
    const { oid, amt, refId } = req.body

    // Here you would verify the payment with Esewa's verification API
    // For now, we'll just return success
    
    res.json({
      success: true,
      message: "Payment verified successfully",
      bookingId,
      transactionId: refId
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    })
  }
})

export default router