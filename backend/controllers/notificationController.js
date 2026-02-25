import Notification from "../models/Notification.js"

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "name")
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Error fetching notifications", error: error.message })
  }
}

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params

    const notification = await Notification.findById(id)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    notification.read = true
    notification.readAt = new Date()
    await notification.save()

    res.json({ message: "Notification marked as read", notification })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Error updating notification", error: error.message })
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    )

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ message: "Error updating notifications", error: error.message })
  }
}

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    })

    res.json({ count })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    res.status(500).json({ message: "Error fetching count", error: error.message })
  }
}

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params

    const notification = await Notification.findById(id)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    await notification.deleteOne()

    res.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({ message: "Error deleting notification", error: error.message })
  }
}
