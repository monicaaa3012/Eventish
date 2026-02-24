import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";

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

        // 1. Resolve actual Sender ID (User ID or Vendor Object ID)
        let senderId = socket.userId;
        let senderModel = "User";
        
        if (socket.userRole === "vendor") {
          const vendor = await Vendor.findOne({ userId: socket.userId });
          if (vendor) {
            senderId = vendor._id;
            senderModel = "Vendor";
          }
        }

        // 2. Create Message in DB
        const message = await Message.create({
          conversationId,
          sender: senderId,
          senderModel: senderModel,
          content,
        });

        // 3. Populate sender info for the UI - ALWAYS populate with full details
        let populatedMsg;
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
        } else {
          populatedMsg = await Message.findById(message._id)
            .populate({
              path: "sender",
              select: "name email _id",
              model: "User"
            });
        }

        // 4. Update Conversation Metadata
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageAt: new Date(),
          $inc: { 
            [`unreadCount.${socket.userRole === "vendor" ? "customer" : "vendor"}`]: 1 
          }
        });

        // 5. Emit to Room
        io.to(conversationId).emit("new_message", populatedMsg);
        
        // 6. Notify Receiver (for global notifications)
        io.to(receiverId).emit("conversation_update", { conversationId, content });

      } catch (error) {
        console.error("Chat Error:", error);
      }
    });

    socket.on("disconnect", () => console.log("Socket Disconnected"));
  });

  return io;
};