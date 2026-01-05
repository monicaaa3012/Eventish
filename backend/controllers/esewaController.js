import crypto from 'crypto'
import Booking from "../models/BookingModel.js"
import { esewaConfig, generateEsewaFormData } from "../utils/esewaConfig.js"
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

    // Check if booking is in scheduled status
    if (booking.status !== "Scheduled") {
      console.log("Booking not in scheduled status:", booking.status)
      return res.status(400).json({ message: "Booking must be scheduled before payment" })
    }

    // Calculate total amount (use service price or default amount)
    const amount = booking.servicePrice || 1000 // Default to 1000 if no service price
    console.log("Payment amount:", amount)
    
    // Generate unique transaction UUID
    const transactionUuid = crypto.randomUUID()
    
    // Product code (merchant ID for eSewa)
    const productCode = esewaConfig.merchantId
    
    // Generate success and failure URLs (these should point to backend endpoints)
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
    const successUrl = `${backendUrl}/api/esewa/success`
    const failureUrl = `${backendUrl}/api/esewa/failure`

    // Generate eSewa form data
    const formData = generateEsewaFormData(amount, transactionUuid, productCode, successUrl, failureUrl)

    // Store transaction details in booking for verification later
    booking.esewaTransactionUuid = transactionUuid
    booking.esewaProductCode = productCode
    booking.esewaAmount = parseInt(formData.total_amount)
    
    // Update booking status to Booked (optimistic update)
    booking.status = "Booked"
    booking.paymentMethod = "online"
    booking.paymentStatus = "pending"
    booking.vendorConfirmed = true

    // Add to status history
    booking.statusHistory.push({
      status: "Booked",
      timestamp: new Date(),
      note: `Booking confirmed with eSewa payment initiation. Transaction UUID: ${transactionUuid}`,
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
    
    console.log("eSewa success callback received:", { oid, amt, refId })
    
    // Find booking by transaction UUID
    const booking = await Booking.findOne({ esewaTransactionUuid: oid })
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    if (!booking) {
      console.log("Booking not found for transaction UUID:", oid)
      return res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/failure?error=booking_not_found`)
    }

    // Update booking with successful payment
    booking.paymentStatus = "completed"
    booking.esewaTransactionId = refId
    booking.esewaOrderId = oid

    // Add to status history
    booking.statusHistory.push({
      status: "Booked",
      timestamp: new Date(),
      note: `Payment completed successfully via eSewa. Transaction ID: ${refId}`,
    })

    await booking.save()

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/payment/esewa/success?oid=${oid}&amt=${amt}&refId=${refId}`)
  } catch (error) {
    console.error("Error handling eSewa success:", error)
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
        booking.status = "Scheduled" // Revert back to scheduled status
        
        // Add to status history
        booking.statusHistory.push({
          status: "Scheduled",
          timestamp: new Date(),
          note: "Payment failed via eSewa. Booking reverted to scheduled status.",
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