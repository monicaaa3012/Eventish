import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: false, // Optional - for service-specific bookings
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    scheduledDate: {
      type: Date,
      required: false, // Set when status changes to Scheduled
    },
    scheduledTime: {
      type: String,
      required: false, // Time in HH:MM format
    },
    servicePrice: {
      type: Number,
      required: false, // Will be filled if serviceId is provided
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model("Booking", bookingSchema)
