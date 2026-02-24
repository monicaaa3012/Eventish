import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import Vendor from "../models/Vendor.js"

// Get or create conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    const { vendorId } = req.params
    const customerId = req.user.id

    let conversation = await Conversation.findOne({
      customer: customerId,
      vendor: vendorId,
    })
      .populate("customer", "name email")
      .populate("vendor", "businessName email")

    if (!conversation) {
      conversation = await Conversation.create({
        customer: customerId,
        vendor: vendorId,
      })
      conversation = await conversation.populate("customer", "name email")
      conversation = await conversation.populate("vendor", "businessName email")
    }

    res.json(conversation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id
    const isVendor = req.user.role === "vendor"

    let query
    if (isVendor) {
      // Find the vendor document by userId
      const vendor = await Vendor.findOne({ userId })
      if (!vendor) {
        return res.json([]) // No vendor profile yet
      }
      query = { vendor: vendor._id }
    } else {
      query = { customer: userId }
    }

    const conversations = await Conversation.find(query)
      .populate("customer", "name email")
      .populate("vendor", "businessName email")
      .sort({ lastMessageAt: -1 })

    res.json(conversations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { limit = 50, before } = req.query

    const query = { conversationId }
    if (before) {
      query.createdAt = { $lt: new Date(before) }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    // Manually populate sender based on senderModel
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgObj = msg.toObject()
        if (msg.senderModel === "Vendor") {
          const vendor = await Vendor.findById(msg.sender).select(
            "businessName email",
          )
          msgObj.sender = vendor
        } else {
          const User = (await import("../models/User.js")).default
          const user = await User.findById(msg.sender).select("name email")
          msgObj.sender = user
        }
        return msgObj
      }),
    )

    res.json(populatedMessages.reverse())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user.id
    const isVendor = req.user.role === "vendor"

    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        read: false,
      },
      { read: true },
    )

    // Reset unread count
    const conversation = await Conversation.findById(conversationId)
    if (conversation) {
      if (isVendor) {
        const vendor = await Vendor.findOne({ userId })
        if (vendor && conversation.vendor.toString() === vendor._id.toString()) {
          conversation.unreadCount.vendor = 0
        }
      } else {
        if (conversation.customer.toString() === userId) {
          conversation.unreadCount.customer = 0
        }
      }
      await conversation.save()
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
