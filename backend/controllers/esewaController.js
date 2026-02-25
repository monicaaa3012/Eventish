import crypto from 'crypto'
import Booking from "../models/BookingModel.js"
import { esewaConfig, generateEsewaFormData, checkTransactionStatus } from "../utils/esewaConfig.js"
import dotenv from 'dotenv'
dotenv.config()

// Initiate eSewa payment
export const initiateEsewaPayment = async (req, res) => {
  console.log("eSewa initiate payment called with:", req.body)
  
  try {
    const { bookingId } = req.body

    if (!bookingId) {
      console.log("No booking ID provided")
      return res.status(400).json({ message: "Booking ID is required" })
    }
    
    console.log("Looking for booking with ID:", bookingId)
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    if (!booking) {
      console.log("Booking not found")
      return res.status(404).json({ message: "Booking not found" })
    }

    console.log("Found booking:", booking._id, "Status:", booking.status)

    // Check if the booking belongs to the current user
    if (booking.customerId._id.toString() !== req.user.id) {
      console.log("Unauthorized access attempt")
      return res.status(403).json({ message: "Unauthorized to pay for this booking" })
    }

    // Check if booking is in scheduled status OR if payment is pending (allow retry)
    if (booking.status !== "Scheduled" && booking.paymentStatus !== "pending") {
      console.log("Booking not in scheduled status:", booking.status, "Payment status:", booking.paymentStatus)
      return res.status(400).json({ 
        message: "Booking must be scheduled before payment",
        currentStatus: booking.status,
        paymentStatus: booking.paymentStatus
      })
    }

    // If there's a pending payment, we're retrying - that's OK
    if (booking.paymentStatus === "pending") {
      console.log("⚠️  Retrying payment - previous attempt was pending")
      console.log("Previous UUID:", booking.esewaTransactionUuid)
    }

    // Calculate total amount (use service price or default amount)
    const amount = booking.servicePrice || 1000 // Default to 1000 if no service price
    console.log("Payment amount:", amount)
    
    // Generate NEW unique transaction UUID (always fresh for each attempt)
    const transactionUuid = crypto.randomUUID()
    console.log("Generated new transaction UUID:", transactionUuid)
    
    // If there was a previous failed transaction, log it
    if (booking.esewaTransactionUuid) {
      console.log("Previous transaction UUID:", booking.esewaTransactionUuid, "- Generating new one")
    }
    
    // Product code (merchant ID for eSewa)
    const productCode = esewaConfig.merchantId
    
    // Generate success and failure URLs (these should point to backend endpoints)
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
    const successUrl = `${backendUrl}/api/esewa/success`
    const failureUrl = `${backendUrl}/api/esewa/failure`

    // Generate eSewa form data
    const formData = generateEsewaFormData(amount, transactionUuid, productCode, successUrl, failureUrl)

    // Clear any previous transaction data and store new transaction details
    booking.esewaTransactionUuid = transactionUuid
    booking.esewaProductCode = productCode
    booking.esewaAmount = parseInt(formData.total_amount)
    booking.esewaTransactionId = undefined // Clear previous transaction ID
    booking.esewaOrderId = undefined // Clear previous order ID
    
    // DO NOT change status to Booked yet - only mark payment as pending
    // Status will be updated to "Booked" only after successful payment verification
    booking.paymentMethod = "online"
    booking.paymentStatus = "pending"

    // Add to status history
    booking.statusHistory.push({
      status: booking.status, // Keep current status
      timestamp: new Date(),
      note: `Payment initiated via eSewa. Transaction UUID: ${transactionUuid}. Awaiting payment confirmation.`,
    })
    
    await booking.save()

    console.log("Generated eSewa form data:", formData)
    
    res.json({
      success: true,
      paymentUrl: esewaConfig.paymentUrl,
      formData: formData,
      booking: booking
    })
  } catch (error) {
    console.error("Error initiating eSewa payment:", error)
    res.status(500).json({ message: "Error initiating payment", error: error.message })
  }
}

// Verify eSewa payment
export const verifyEsewaPayment = async (req, res) => {
  try {
    const { 
      oid, 
      amt, 
      refId, 
      bookingId 
    } = req.body

    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Verify the payment with eSewa
    const verificationData = {
      amt: amt,
      rid: refId,
      pid: oid,
      scd: esewaConfig.merchantId
    }

    // In a real implementation, you would make an HTTP request to eSewa's verification endpoint
    // For now, we'll simulate successful verification
    const isPaymentValid = true // This should be the result of actual eSewa verification

    if (isPaymentValid) {
      // Update booking status to Booked
      booking.status = "Booked"
      booking.paymentMethod = "online"
      booking.paymentStatus = "completed"
      booking.vendorConfirmed = true
      booking.esewaTransactionId = refId
      booking.esewaOrderId = oid

      // Add to status history
      booking.statusHistory.push({
        status: "Booked",
        timestamp: new Date(),
        note: `Booking confirmed with eSewa payment. Transaction ID: ${refId}`,
      })

      await booking.save()

      res.json({
        success: true,
        message: "Payment verified successfully",
        booking: booking
      })
    } else {
      // Payment verification failed
      booking.paymentStatus = "failed"
      await booking.save()

      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      })
    }
  } catch (error) {
    console.error("Error verifying eSewa payment:", error)
    res.status(500).json({ message: "Error verifying payment", error: error.message })
  }
}

// Simulate eSewa payment for development
export const simulateEsewaPayment = async (req, res) => {
  try {
    const { bookingId, success = true } = req.body
    
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    if (success) {
      // Simulate successful payment
      booking.status = "Booked"
      booking.paymentMethod = "online"
      booking.paymentStatus = "completed"
      booking.vendorConfirmed = true
      booking.esewaTransactionId = `DEV_${Date.now()}`
      booking.esewaOrderId = booking.esewaProductCode

      // Add to status history
      booking.statusHistory.push({
        status: "Booked",
        timestamp: new Date(),
        note: `Booking confirmed with simulated eSewa payment (Development Mode)`,
      })

      await booking.save()

      res.json({
        success: true,
        message: "Payment simulated successfully",
        booking: booking
      })
    } else {
      // Simulate failed payment
      booking.paymentStatus = "failed"
      await booking.save()

      res.status(400).json({
        success: false,
        message: "Payment simulation failed"
      })
    }
  } catch (error) {
    console.error("Error simulating eSewa payment:", error)
    res.status(500).json({ message: "Error simulating payment", error: error.message })
  }
}

// Handle eSewa payment success callback
export const handleEsewaSuccess = async (req, res) => {
  try {
    const { oid, amt, refId } = req.query
    
    console.log("=== eSewa SUCCESS CALLBACK ===")
    console.log("Query params:", { oid, amt, refId })
    
    // Find booking by transaction UUID
    const booking = await Booking.findOne({ esewaTransactionUuid: oid })
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    if (!booking) {
      console.log("❌ Booking not found for transaction UUID:", oid)
      return res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/failure?error=booking_not_found`)
    }

    console.log("✅ Booking found:", booking._id)
    console.log("Current payment status:", booking.paymentStatus)

    // Verify payment with eSewa status check API
    try {
      const statusResponse = await checkTransactionStatus(
        booking.esewaProductCode,
        oid,
        booking.esewaAmount
      )
      
      console.log("eSewa status check response:", statusResponse)
      
      // Check if payment is successful
      if (statusResponse.status === 'COMPLETE' || statusResponse.status === 'SUCCESS') {
        // Update booking with successful payment
        booking.status = "Booked" // NOW we change status to Booked
        booking.paymentStatus = "completed"
        booking.vendorConfirmed = true
        booking.esewaTransactionId = refId
        booking.esewaOrderId = oid

        // Add to status history
        booking.statusHistory.push({
          status: "Booked",
          timestamp: new Date(),
          note: `Payment completed successfully via eSewa. Transaction ID: ${refId}`,
        })

        await booking.save()
        
        console.log("✅ Booking updated - new payment status:", booking.paymentStatus)
        console.log("=== END eSewa SUCCESS CALLBACK ===")

        // Redirect to frontend success page
        return res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/success?oid=${oid}&amt=${amt}&refId=${refId}`)
      } else {
        console.log("❌ Payment verification failed - status:", statusResponse.status)
        throw new Error('Payment verification failed')
      }
    } catch (verifyError) {
      console.error("❌ Error verifying payment with eSewa:", verifyError)
      // If verification fails, still update booking but mark for manual review
      booking.status = "Booked" // Change to Booked even if verification pending
      booking.paymentStatus = "pending_verification"
      booking.vendorConfirmed = true
      booking.esewaTransactionId = refId
      booking.esewaOrderId = oid
      
      booking.statusHistory.push({
        status: "Booked",
        timestamp: new Date(),
        note: `Payment received but verification pending. Transaction ID: ${refId}. Manual review required.`,
      })
      
      await booking.save()
      
      // Still redirect to success but with a note
      return res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/success?oid=${oid}&amt=${amt}&refId=${refId}&verify=pending`)
    }
  } catch (error) {
    console.error("❌ Error handling eSewa success:", error)
    res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/failure?error=processing_failed`)
  }
}

// Handle eSewa payment failure callback
export const handleEsewaFailure = async (req, res) => {
  try {
    const { pid } = req.query
    
    console.log("eSewa failure callback received:", { pid })
    
    // Find booking by transaction UUID
    if (pid) {
      const booking = await Booking.findOne({ esewaTransactionUuid: pid })
      if (booking) {
        booking.paymentStatus = "failed"
        // Keep status as Scheduled so user can try payment again
        // Don't revert to Scheduled if it's already something else
        
        // Add to status history
        booking.statusHistory.push({
          status: booking.status,
          timestamp: new Date(),
          note: "Payment failed or cancelled via eSewa. User can retry payment.",
        })
        
        await booking.save()
      }
    }

    // Redirect to frontend failure page
    res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/failure?pid=${pid}`)
  } catch (error) {
    console.error("Error handling eSewa failure:", error)
    res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/failure?error=processing_failed`)
  }
}

// Check payment status - for when no response received within 5 minutes
export const checkPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params
    
    console.log("=== CHECKING PAYMENT STATUS ===")
    console.log("Booking ID:", bookingId)
    
    const booking = await Booking.findById(bookingId)
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      })
    }

    // Check if the booking belongs to the current user
    if (booking.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized to check this booking" 
      })
    }

    // If payment is already completed, return success
    if (booking.paymentStatus === "completed") {
      return res.json({
        success: true,
        status: "completed",
        message: "Payment already completed",
        booking: booking
      })
    }

    // If no transaction UUID, payment was never initiated
    if (!booking.esewaTransactionUuid) {
      return res.json({
        success: false,
        status: "not_initiated",
        message: "Payment was not initiated",
        booking: booking
      })
    }

    // Check with eSewa API
    try {
      const statusResponse = await checkTransactionStatus(
        booking.esewaProductCode,
        booking.esewaTransactionUuid,
        booking.esewaAmount
      )
      
      console.log("eSewa status check response:", statusResponse)
      
      // Update booking based on status
      if (statusResponse.status === 'COMPLETE' || statusResponse.status === 'SUCCESS') {
        booking.status = "Booked" // Change status to Booked
        booking.paymentStatus = "completed"
        booking.vendorConfirmed = true
        booking.esewaTransactionId = statusResponse.transaction_code || statusResponse.ref_id
        
        booking.statusHistory.push({
          status: "Booked",
          timestamp: new Date(),
          note: `Payment verified via status check API. Transaction ID: ${statusResponse.transaction_code}`,
        })
        
        await booking.save()
        
        return res.json({
          success: true,
          status: "completed",
          message: "Payment verified successfully",
          booking: booking
        })
      } else if (statusResponse.status === 'PENDING') {
        return res.json({
          success: false,
          status: "pending",
          message: "Payment is still pending",
          booking: booking
        })
      } else {
        // Payment failed or cancelled - keep status as Scheduled
        booking.paymentStatus = "failed"
        // Don't change booking status - keep it as Scheduled so user can try again
        
        booking.statusHistory.push({
          status: booking.status,
          timestamp: new Date(),
          note: `Payment verification failed. Status: ${statusResponse.status}`,
        })
        
        await booking.save()
        
        return res.json({
          success: false,
          status: "failed",
          message: "Payment verification failed",
          booking: booking
        })
      }
    } catch (verifyError) {
      console.error("Error checking payment status with eSewa:", verifyError)
      
      return res.json({
        success: false,
        status: "verification_error",
        message: "Unable to verify payment status. Please contact support.",
        booking: booking
      })
    }
  } catch (error) {
    console.error("Error checking payment status:", error)
    res.status(500).json({ 
      success: false,
      message: "Error checking payment status", 
      error: error.message 
    })
  }
}