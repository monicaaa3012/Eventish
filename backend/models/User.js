import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor" 
    }]
  },
  { timestamps: true },
)

export default mongoose.model("User", userSchema)
