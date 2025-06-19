import Event from "../models/Event.js";

// CREATE
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    const event = new Event({
      title,
      description,
      date,
      location,
      createdBy: req.user.id,
    });

    const savedEvent = await event.save();
    res.status(201).json({ message: "Event created successfully", event: savedEvent });
  } catch (error) {
    res.status(500).json({ message: "Error creating event", error: error.message });
  }
};

// GET ALL (Admin)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

// GET MY EVENTS
export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user events", error: error.message });
  }
};

// UPDATE
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location } = req.body;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, description, date, location },
      { new: true }
    ).populate("createdBy", "name email");

    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

// DELETE
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error: error.message });
  }
};

// GET BY ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error: error.message });
  }
};

// GET STATS (Admin)
export const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const eventsThisMonth = await Event.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    const eventsByUser = await Event.aggregate([
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userName: "$user.name",
          userEmail: "$user.email",
          eventCount: "$count",
        },
      },
      { $sort: { eventCount: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalEvents,
      eventsThisMonth,
      topEventCreators: eventsByUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching event statistics", error: error.message });
  }
};
