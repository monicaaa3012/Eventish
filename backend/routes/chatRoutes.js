import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  markAsRead,
} from "../controllers/chatController.js"

const router = express.Router()

// Get all conversations for logged-in user
router.get("/conversations", protect, getConversations)

// Create or get conversation with a vendor
router.post("/conversation/:vendorId", protect, getOrCreateConversation)

// Get message history for a conversation
router.get("/history/:conversationId", protect, getMessages)

// Mark messages as read
router.post("/mark-read/:conversationId", protect, markAsRead)

// Legacy routes for compatibility
router.get("/conversations/:vendorId", protect, getOrCreateConversation)
router.get("/messages/:conversationId", protect, getMessages)
router.put("/messages/:conversationId/read", protect, markAsRead)

export default router
