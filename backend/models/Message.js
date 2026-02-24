import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderModel: {
      type: String,
      enum: ["User", "Vendor"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 })

export default mongoose.model("Message", messageSchema)
