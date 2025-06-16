const mongoose = require("mongoose")
const vendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true },
    companyName: String, // ✅ add this
    bio: String, // ✅ add this
    profileImage: String, // ✅ add this
    description: String,
    services: [String],
    location: { type: String, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    portfolio: [String],
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
