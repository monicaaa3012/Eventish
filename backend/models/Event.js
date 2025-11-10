import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    location: String,
    budget: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    servicesNeeded: [{ type: String }],
  },
  { timestamps: true },
)

export default mongoose.model("Event", eventSchema)
