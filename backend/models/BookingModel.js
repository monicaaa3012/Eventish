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
      enum: ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"],
      default: "Pending",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    servicePrice: {
      type: Number,
      required: false, // Will be filled if serviceId is provided
    },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      date: { type: Date, default: Date.now }
    },
  },
  { timestamps: true },
)

export default mongoose.model("Booking", bookingSchema)
