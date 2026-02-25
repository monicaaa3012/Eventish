import { Expo } from "expo-server-sdk"
import Notification from "../models/Notification.js"
import User from "../models/User.js"

// Create Expo SDK client
const expo = new Expo()

/**
 * Send push notification to a user
 * @param {string} userId - Recipient user ID
 * @param {object} notification - Notification details
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {string} notification.type - Notification type (booking, message, etc.)
 * @param {object} notification.data - Additional data to send with notification
 */
export async function sendPushNotification(userId, notification) {
  try {
    console.log(`📱 Attempting to send push notification to user: ${userId}`)
    
    // Get user's push token
    const user = await User.findById(userId)
    if (!user || !user.pushToken) {
      console.log(`⚠️ No push token found for user ${userId}`)
      // Still save notification to database even without push token
    }

    // Save notification to database
    console.log(`💾 Saving notification to database...`)
    const dbNotification = new Notification({
      recipient: userId,
      sender: notification.senderId || null,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
    })
    await dbNotification.save()
    console.log(`✅ Notification saved to database with ID: ${dbNotification._id}`)

    // If no push token, we're done (notification is in DB for user to see)
    if (!user || !user.pushToken) {
      return
    }

    // Check if token is valid Expo push token
    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.error(`❌ Invalid Expo push token for user ${userId}`)
      return
    }

    // Prepare push notification message
    const message = {
      to: user.pushToken,
      sound: "default",
      title: notification.title,
      body: notification.body,
      data: {
        ...notification.data,
        notificationId: dbNotification._id.toString(),
      },
      badge: 1,
    }

    console.log(`📤 Sending push notification via Expo...`)
    
    // Send push notification
    const chunks = expo.chunkPushNotifications([message])
    const tickets = []

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
        tickets.push(...ticketChunk)
        console.log(`✅ Push notification sent successfully:`, ticketChunk)
      } catch (error) {
        console.error("❌ Error sending push notification chunk:", error)
      }
    }

    console.log(`✅ Push notification sent to user ${userId}:`, notification.title)
    return tickets
  } catch (error) {
    console.error("❌ Error in sendPushNotification:", error)
  }
}

/**
 * Send booking notification to vendor
 */
export async function sendBookingNotificationToVendor(vendorUserId, bookingDetails) {
  await sendPushNotification(vendorUserId, {
    title: "New Booking Request",
    body: `${bookingDetails.customerName} has requested to book your service${
      bookingDetails.serviceName ? `: ${bookingDetails.serviceName}` : ""
    }`,
    type: "booking",
    data: {
      type: "booking",
      bookingId: bookingDetails.bookingId,
    },
  })
}

/**
 * Send booking status update notification to customer
 */
export async function sendBookingStatusNotification(customerUserId, statusDetails) {
  const statusMessages = {
    Scheduled: "Your booking has been scheduled",
    Booked: "Your booking has been confirmed",
    Completed: "Your booking has been completed",
    Cancelled: "Your booking has been cancelled",
  }

  await sendPushNotification(customerUserId, {
    title: "Booking Status Update",
    body: `${statusMessages[statusDetails.status] || "Booking status updated"} - ${
      statusDetails.vendorName
    }`,
    type: "booking_status",
    data: {
      type: "booking",
      bookingId: statusDetails.bookingId,
      status: statusDetails.status,
    },
  })
}

/**
 * Send message notification
 */
export async function sendMessageNotification(recipientUserId, messageDetails) {
  await sendPushNotification(recipientUserId, {
    title: `Message from ${messageDetails.senderName}`,
    body: messageDetails.messagePreview,
    type: "message",
    senderId: messageDetails.senderId,
    data: {
      type: "message",
      conversationId: messageDetails.conversationId,
      senderId: messageDetails.senderId,
    },
  })
}

/**
 * Send review notification to vendor
 */
export async function sendReviewNotification(vendorUserId, reviewDetails) {
  await sendPushNotification(vendorUserId, {
    title: "New Review",
    body: `${reviewDetails.customerName} left a ${reviewDetails.rating}-star review`,
    type: "review",
    data: {
      type: "review",
      bookingId: reviewDetails.bookingId,
      rating: reviewDetails.rating,
    },
  })
}
