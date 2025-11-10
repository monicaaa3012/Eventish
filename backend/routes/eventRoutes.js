import express from "express"
import {
  createEvent,
  getAllEvents,
  getUserEvents,
  updateEvent,
  deleteEvent,
  getEventStats,
  getEventById,
} from "../controllers/eventController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

// Create event (authenticated users)
router.post("/", protect, createEvent)

// Get all events (admin only)
router.get(
  "/all",
  protect,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" })
    }
    next()
  },
  getAllEvents,
)

// Get user's own events
router.get("/my-events", protect, getUserEvents)

// Get event statistics (admin only)
router.get(
  "/stats",
  protect,
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
router.put("/:id", protect, updateEvent)

// Delete event
router.delete("/:id", protect, deleteEvent)

export default router
