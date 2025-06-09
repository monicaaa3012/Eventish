const Booking = require("../models/Booking")
const Vendor = require("../models/Vendor")
const Event = require("../models/Event")

exports.createBooking = async (req, res) => {
  try {
    const { vendorId, eventId, date, message } = req.body

    // Verify vendor exists
    const vendor = await Vendor.findById(vendorId)
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" })
    }

    // Verify event exists and user owns it
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to book for this event" })
    }

    const booking = new Booking({
      eventId,
      vendorId,
      customerId: req.user.id,
      date: date || event.date,
      message,
      status: "Pending",
    })

    const savedBooking = await booking.save()
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("vendorId", "businessName contactInfo")
      .populate("eventId", "title date location")
      .populate("customerId", "name email")

    res.status(201).json({
      message: "Booking request sent successfully",
      booking: populatedBooking,
    })
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message })
  }
}

exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate("vendorId", "businessName contactInfo")
      .populate("eventId", "title date location")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message })
  }
}

exports.getVendorBookings = async (req, res) => {
  try {
    // Find vendor profile for the current user
    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" })
    }

    const bookings = await Booking.find({ vendorId: vendor._id })
      .populate("customerId", "name email")
      .populate("eventId", "title date location")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendor bookings", error: error.message })
  }
}

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user is the vendor for this booking
    const vendor = await Vendor.findOne({ userId: req.user.id })
    if (!vendor || booking.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this booking" })
    }

    const updatedBooking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
      .populate("customerId", "name email")
      .populate("eventId", "title date location")

    res.json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    })
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error: error.message })
  }
}
