const mongoose = require("mongoose")

const vendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true },
    description: String,
    services: [String], // e.g., ['Photography', 'Catering', 'Music']
    location: { type: String, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    portfolio: [String], // URLs to portfolio images
    availability: [
      {
        date: Date,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Vendor", vendorSchema)