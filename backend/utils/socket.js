import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import { sendMessageNotification } from "./pushNotifications.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", credentials: true },
  });

  // Middleware: Verify JWT Token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket Connected: ${socket.userId}`);

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, receiverId } = data;

        console.log(`💬 Message received from ${socket.userId} (${socket.userRole})`);

        // 1. Get conversation to determine receiver
        const conversation = await Conversation.findById(conversationId)
          .populate('customer', '_id')
          .populate('vendor', 'userId');

        if (!conversation) {
          console.error("❌ Conversation not found:", conversationId);
          return;
        }

        // 2. Resolve actual Sender ID (User ID or Vendor Object ID)
        let senderId = socket.userId;
        let senderModel = "User";
        let actualReceiverId = null;
        
        if (socket.userRole === "vendor") {
          const vendor = await Vendor.findOne({ userId: socket.userId });
          if (vendor) {
            senderId = vendor._id;
            senderModel = "Vendor";
            // Receiver is the customer
            actualReceiverId = conversation.customer._id.toString();
          }
        } else {
          // Sender is customer, receiver is vendor's userId
          actualReceiverId = conversation.vendor.userId.toString();
        }

        console.log(`📤 Sending from ${senderModel} to user: ${actualReceiverId}`);

        // 3. Create Message in DB
        const message = await Message.create({
          conversationId,
          sender: senderId,
          senderModel: senderModel,
          content,
        });

        // 4. Populate sender info for the UI - ALWAYS populate with full details
        let populatedMsg;
        let senderName;
        if (senderModel === "Vendor") {
          populatedMsg = await Message.findById(message._id)
            .populate({
              path: "sender",
              select: "businessName email userId",
              model: "Vendor",
              populate: {
                path: "userId",
                select: "_id"
              }
            });
          senderName = populatedMsg.sender?.businessName || "Vendor";
        } else {
          populatedMsg = await Message.findById(message._id)
            .populate({
              path: "sender",
              select: "name email _id",
              model: "User"
            });
          senderName = populatedMsg.sender?.name || "User";
        }

        // 5. Update Conversation Metadata
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageAt: new Date(),
          $inc: { 
            [`unreadCount.${socket.userRole === "vendor" ? "customer" : "vendor"}`]: 1 
          }
        });

        // 6. Emit to Room
        io.to(conversationId).emit("new_message", populatedMsg);
        
        // 7. Notify Receiver (for global notifications)
        io.to(receiverId).emit("conversation_update", { conversationId, content });

        // 8. Send push notification to receiver
        if (actualReceiverId) {
          const messagePreview = content.length > 50 ? content.substring(0, 50) + "..." : content;
          console.log(`📱 Sending notification to user: ${actualReceiverId}`);
          
          await sendMessageNotification(actualReceiverId, {
            senderName,
            messagePreview,
            conversationId,
            senderId: socket.userId,
          });
          
          console.log(`✅ Message notification sent to ${actualReceiverId}`);
        } else {
          console.log(`⚠️ Could not determine receiver ID`);
        }

      } catch (error) {
        console.error("❌ Chat Error:", error);
      }
    });

    socket.on("disconnect", () => console.log("Socket Disconnected"));
  });

  return io;
};