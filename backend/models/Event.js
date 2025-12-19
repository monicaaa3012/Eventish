import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
    budget: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Event type for AI recommendations
    eventType: {
      type: String,
      required: true,
      enum: [
        "Wedding",
        "Birthday Party",
        "Corporate Event",
        "Anniversary",
        "Baby Shower",
        "Graduation",
        "Holiday Party",
        "Conference",
        "Workshop",
        "Other"
      ]
    },

    // Updated to match frontend
    requirements: [{ type: String }],
  },
  { timestamps: true }
)

export default mongoose.model("Event", eventSchema)
