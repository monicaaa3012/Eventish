import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  { 
    
    title: {          // ADD THIS
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    //  ADD THIS FOR JACCARD AI RECOMMENDATION
    serviceType: {
      type: String,
      required: true,
      enum: [
        "venue",
        "catering",
        "decoration",
        "photography",
        "videography",
        "music",
        "dj",
        "band",
        "makeup",
        "hair",
        "fashion",
        "jewelry",
        "flowers",
        "lighting",
        "sound",
        "transport",
        "security",
        "cleaning",
        "planning",
        "coordination",
        "entertainment",
        "mc",
        "dance",
        "bartending",
        "cake",
        "desserts",
        "printing",
        "invitations",
        "gifts",
        "favors"
      ],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
