import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import Vendor from "../models/Vendor.js"

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  })

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      socket.userRole = decoded.role
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`)

    // Join user's personal room
    socket.join(socket.userId)

    // Join conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId)
      console.log(`User ${socket.userId} joined conversation ${conversationId}`)
    })

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, receiverId } = data

        // Determine sender ID based on role
        let senderId = socket.userId
        if (socket.userRole === "vendor") {
          const vendor = await Vendor.findOne({ userId: socket.userId })
          if (vendor) {
            senderId = vendor._id
          }
        }

        // Create message
        const message = await Message.create({
          conversationId,
          sender: senderId,
          senderModel: socket.userRole === "vendor" ? "Vendor" : "User",
          content,
        })

        // Manually populate sender
        let messageObj = message.toObject()
        if (socket.userRole === "vendor") {
          const vendor = await Vendor.findById(senderId).select(
            "businessName email",
          )
          messageObj.sender = vendor
        } else {
          const User = (await import("../models/User.js")).default
          const user = await User.findById(senderId).select("name email")
          messageObj.sender = user
        }

        // Update conversation
        const conversation = await Conversation.findById(conversationId)
        if (conversation) {
          conversation.lastMessage = content
          conversation.lastMessageAt = new Date()

          // Increment unread count for receiver
          if (conversation.customer.toString() === receiverId) {
            conversation.unreadCount.customer += 1
          } else if (conversation.vendor.toString() === receiverId) {
            conversation.unreadCount.vendor += 1
          }

          await conversation.save()
        }

        // Emit to conversation room
        io.to(conversationId).emit("new_message", messageObj)

        // Emit to receiver's personal room for notification
        io.to(receiverId).emit("conversation_update", {
          conversationId,
          lastMessage: content,
          unreadCount: conversation.unreadCount,
        })
      } catch (error) {
        console.error("Socket send_message error:", error)
        socket.emit("error", { message: error.message })
      }
    })

    // Typing indicator
    socket.on("typing", ({ conversationId, receiverId }) => {
      socket.to(receiverId).emit("user_typing", { conversationId })
    })

    socket.on("stop_typing", ({ conversationId, receiverId }) => {
      socket.to(receiverId).emit("user_stop_typing", { conversationId })
    })

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })

  return io
}
