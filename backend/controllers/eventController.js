const Event = require("../models/Event")

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, budget } = req.body

    console.log("Creating event with data:", { title, description, date, location, budget, createdBy: req.user.id })

    const event = new Event({
      title,
      description,
      date,
      location,
      budget,
      createdBy: req.user.id,
    })

    const savedEvent = await event.save()
    console.log("Event saved successfully:", savedEvent)

    res.status(201).json({ message: "Event created successfully", event: savedEvent })
  } catch (error) {
    console.error("Error creating event:", error)
    res.status(500).json({ message: "Error creating event", error: error.message })
  }
}

exports.getAllEvents = async (req, res) => {
  try {
    console.log("Fetching all events for admin...")
    const events = await Event.find().populate("createdBy", "name email").sort({ createdAt: -1 })
    console.log("Found events:", events.length)
    res.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    res.status(500).json({ message: "Error fetching events", error: error.message })
  }
}

exports.getUserEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ message: "Error fetching user events", error: error.message })
  }
}

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, date, location, budget } = req.body

    const event = await Event.findById(id)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user owns the event or is admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" })
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, description, date, location, budget },
      { new: true },
    ).populate("createdBy", "name email")

    res.json({ message: "Event updated successfully", event: updatedEvent })
  } catch (error) {
    res.status(500).json({ message: "Error updating event", error: error.message })
  }
}

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params

    const event = await Event.findById(id)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user owns the event or is admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this event" })
    }

    await Event.findByIdAndDelete(id)
    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Error deleting event", error: error.message })
  }
}

exports.getEventStats = async (req, res) => {
  try {
    console.log("Fetching event stats...")

    const totalEvents = await Event.countDocuments()
    console.log("Total events:", totalEvents)

    const eventsThisMonth = await Event.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    })
    console.log("Events this month:", eventsThisMonth)

    const eventsByUser = await Event.aggregate([
      {
        $group: {
          _id: "$createdBy",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userName: "$user.name",
          userEmail: "$user.email",
          eventCount: "$count",
        },
      },
      {
        $sort: { eventCount: -1 },
      },
      {
        $limit: 10,
      },
    ])

    res.json({
      totalEvents,
      eventsThisMonth,
      topEventCreators: eventsByUser,
    })
  } catch (error) {
    console.error("Error fetching event statistics:", error)
    res.status(500).json({ message: "Error fetching event statistics", error: error.message })
  }
}

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params
    const event = await Event.findById(id).populate("createdBy", "name email")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json(event)
  } catch (error) {
    res.status(500).json({ message: "Error fetching event", error: error.message })
  }
}
