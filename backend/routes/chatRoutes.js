import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  markAsRead,
} from "../controllers/chatController.js"

const router = express.Router()

router.get("/conversations", protect, getConversations)
router.get("/conversations/:vendorId", protect, getOrCreateConversation)
router.get("/messages/:conversationId", protect, getMessages)
router.put("/messages/:conversationId/read", protect, markAsRead)

export default router
