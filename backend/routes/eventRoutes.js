import express from "express";
import {
  createEvent,
  getAllEvents,
  getUserEvents,
  updateEvent,
  deleteEvent,
  getEventStats,
  getEventById,
} from "../controllers/eventController.js"; // note .js extension

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create event (authenticated users)
router.post("/", authMiddleware, createEvent);

// Get all events (admin only)
router.get(
  "/all",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  },
  getAllEvents,
);

// Get user's own events
router.get("/my-events", authMiddleware, getUserEvents);

// Get event statistics (admin only)
router.get(
  "/stats",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  },
  getEventStats,
);

// Get single event by ID (public route for now)
router.get("/:id", getEventById);

// Update event
router.put("/:id", authMiddleware, updateEvent);

// Delete event
router.delete("/:id", authMiddleware, deleteEvent);

export default router;  // ESM export
