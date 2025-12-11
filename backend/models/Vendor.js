import mongoose from "mongoose"

const vendorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true },
    companyName: String,
    bio: String,
    profileImage: String,
    description: String,
    services: [String],
    location: { type: String, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    portfolio: [String],
    availability: [
      {
        date: Date,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    // Review fields
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }
      }
    ],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

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

export default mongoose.model("Vendor", vendorSchema)
