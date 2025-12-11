import Booking from "../models/BookingModel.js"
import Service from "../models/ServiceModel.js"
import Vendor from "../models/Vendor.js"

// Create booking
export const createBooking = async (req, res) => {
  try {
    const { vendorId, serviceId, eventId, message } = req.body

    let servicePrice = null
    if (serviceId) {
      const service = await Service.findById(serviceId)
      if (service) {
        servicePrice = service.price
      }
    }

    const booking = new Booking({
      customerId: req.user.id,
      vendorId,
      serviceId,
      eventId,
      message,
      servicePrice,
    })

    const savedBooking = await booking.save()
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    res.status(201).json({
      message: "Booking request sent successfully",
      booking: populatedBooking,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    res.status(500).json({ message: "Error creating booking", error: error.message })
  }
}

// Get current vendor's bookings (using JWT token)
export const getCurrentVendorBookings = async (req, res) => {
  try {
    // Find vendor profile for current user
    const vendor = await Vendor.findOne({ userId: req.user.id })

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" })
    }

    const bookings = await Booking.find({ vendorId: vendor._id })
      .populate("customerId", "name email")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    console.error("Error fetching current vendor bookings:", error)
    res.status(500).json({ message: "Error fetching bookings", error: error.message })
  }
}

// Get customer bookings
export const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    console.error("Error fetching customer bookings:", error)
    res.status(500).json({ message: "Error fetching bookings", error: error.message })
  }
}

// Get vendor bookings by vendor ID
export const getVendorBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ vendorId: req.params.vendorId })
      .populate("customerId", "name email")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    console.error("Error fetching vendor bookings:", error)
    res.status(500).json({ message: "Error fetching bookings", error: error.message })
  }
}

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, scheduledDate, scheduledTime, note } = req.body

    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Update status
    booking.status = status

    // Add to status history
    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`,
    })

    // If scheduling, save the date and time
    if (status === "Scheduled" && scheduledDate) {
      booking.scheduledDate = scheduledDate
      booking.scheduledTime = scheduledTime || null
    }

    await booking.save()

    const updatedBooking = await Booking.findById(id)
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    res.json({
      message: `Booking ${status.toLowerCase()} successfully`,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ message: "Error updating booking status", error: error.message })
  }
}

// Confirm vendor with payment method
export const confirmVendorWithPayment = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentMethod } = req.body

    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if the booking belongs to the current user
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to confirm this booking" })
    }

    // Check if booking is in scheduled status
    if (booking.status !== "Scheduled") {
      return res.status(400).json({ message: "Booking must be scheduled before confirmation" })
    }

    // Update booking with payment method and confirmation
    booking.paymentMethod = paymentMethod
    booking.vendorConfirmed = true
    booking.status = "Completed"
    
    // If cash payment, mark as completed immediately
    if (paymentMethod === "cash") {
      booking.paymentStatus = "completed"
    } else {
      // For online payment, keep as pending (would integrate with payment gateway)
      booking.paymentStatus = "pending"
    }

    // Add to status history
    booking.statusHistory.push({
      status: "Completed",
      timestamp: new Date(),
      note: `Booking completed with ${paymentMethod} payment`,
    })

    await booking.save()

    const updatedBooking = await Booking.findById(id)
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    res.json({
      message: `Booking completed with ${paymentMethod} payment`,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Error confirming vendor:", error)
    res.status(500).json({ message: "Error confirming vendor", error: error.message })
  }
}

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    console.error("Error fetching all bookings:", error)
    res.status(500).json({ message: "Error fetching bookings", error: error.message })
  }
}
