import Event from "../models/Event.js";
import Vendor from "../models/Vendor.js";

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the latest event created by this user
    const latestEvent = await Event.findOne({ createdBy: userId }).sort({ createdAt: -1 });

    if (!latestEvent) {
      return res.json({ vendors: [] });
    }

    const { title, location, budget } = latestEvent;

    // Build query: location + budget + services ~ event title
    const query = {
      location,
      "priceRange.min": { $lte: budget },
      "priceRange.max": { $gte: budget * 0.5 },
      services: { $regex: title, $options: "i" },
    };

    const vendors = await Vendor.find(query).sort({ rating: -1 }).limit(6);

    res.json({ vendors, event: latestEvent });
  } catch (error) {
    console.error("Error in recommendations:", error);
    res.status(500).json({ message: "Server error in recommendations" });
  }
};
