import mongoose from "mongoose"

const conversationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      customer: { type: Number, default: 0 },
      vendor: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
)

// Unique conversation per customer-vendor pair
conversationSchema.index({ customer: 1, vendor: 1 }, { unique: true })

export default mongoose.model("Conversation", conversationSchema)
