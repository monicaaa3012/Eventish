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
    const { status } = req.body

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
      .populate("customerId", "name email")
      .populate("vendorId", "businessName")
      .populate("serviceId", "description price")
      .populate("eventId", "title date location")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.json({
      message: `Booking ${status.toLowerCase()} successfully`,
      booking,
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ message: "Error updating booking status", error: error.message })
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
