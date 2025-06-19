import mongoose from "mongoose"; // ✅ ES Module import

const EventSchema = new mongoose.Schema({ // ✅ Schema definition
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  location: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ✅ reference to the User model
    required: true,
  },
}, { timestamps: true }); // ✅ auto adds createdAt & updatedAt fields

const Event = mongoose.model("Event", EventSchema); // ✅ model creation

export default Event; // ✅ ES Module default export
