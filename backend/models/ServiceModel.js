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
        "music",
        "makeup"
      ],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
