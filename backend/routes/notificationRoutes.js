import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
} from "../controllers/notificationController.js"

const router = express.Router()

// All routes require authentication
router.use(protect)

// Get user notifications
router.get("/", getUserNotifications)

// Get unread count
router.get("/unread-count", getUnreadCount)

// Mark notification as read
router.patch("/:id/read", markNotificationAsRead)

// Mark all as read
router.patch("/read-all", markAllNotificationsAsRead)

// Delete notification
router.delete("/:id", deleteNotification)

export default router
