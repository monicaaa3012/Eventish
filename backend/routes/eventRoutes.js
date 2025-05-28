const express = require("express")
const router = express.Router()
const {
  createEvent,
  getAllEvents,
  getUserEvents,
  updateEvent,
  deleteEvent,
  getEventStats,
  getEventById,
} = require("../controllers/eventController")
const authMiddleware = require("../middleware/authMiddleware")

// Create event (authenticated users)
router.post("/", authMiddleware, createEvent)

// Get all events (admin only)
router.get(
  "/all",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }
    next()
  },
  getAllEvents,
)

// Get user's own events
router.get("/my-events", authMiddleware, getUserEvents)

// Get event statistics (admin only)
router.get(
  "/stats",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }
    next()
  },
  getEventStats,
)

// Get single event by ID (public route for now)
router.get("/:id", getEventById)

// Update event
router.put("/:id", authMiddleware, updateEvent)

// Delete event
router.delete("/:id", authMiddleware, deleteEvent)

module.exports = router
