import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { getSocket, connectSocket } from "../utils/socket"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function ChatPage() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(false)
  const [myId, setMyId] = useState(null) // Store the actual ID to compare with
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const socket = getSocket()

  // vendorId param is actually the "other party" ID (vendor for customer, customer for vendor)
  const otherPartyId = vendorId

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    loadConversation()
    connectSocket()

    return () => {
      if (conversation) {
        const receiverId = user.role === "vendor" ? conversation.customer._id : conversation.vendor._id
        socket?.emit("stop_typing", {
          conversationId: conversation._id,
          receiverId,
        })
      }
    }
  }, [otherPartyId])

  useEffect(() => {
    if (!socket || !conversation) return

    socket.emit("join_conversation", conversation._id)

    socket.on("new_message", (message) => {
      setMessages((prev) => [...prev, message])
      scrollToBottom()
    })

    socket.on("user_typing", ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setTyping(true)
      }
    })

    socket.on("user_stop_typing", ({ conversationId }) => {
      if (conversationId === conversation._id) {
        setTyping(false)
      }
    })

    return () => {
      socket.off("new_message")
      socket.off("user_typing")
      socket.off("user_stop_typing")
    }
  }, [socket, conversation])

  const loadConversation = async () => {
    try {
      // For customers, otherPartyId is vendorId
      // For vendors, otherPartyId is customerId - we need to find the conversation
      let conv
      if (user.role === "vendor") {
        // Vendor viewing conversation with customer
        const { data: allConvs } = await axios.get(
          `${API_URL}/api/chat/conversations`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        // otherPartyId is the customer's user ID
        conv = allConvs.find((c) => c.customer._id === otherPartyId)
        if (!conv) {
          console.log("Conversation not found for customer:", otherPartyId)
          alert("Conversation not found")
          navigate("/chat")
          return
        }
        // Set myId to vendor's _id for message comparison
        setMyId(conv.vendor._id)
      } else {
        // Customer viewing conversation with vendor
        const { data } = await axios.get(
          `${API_URL}/api/chat/conversations/${otherPartyId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        )
        conv = data
        // Set myId to customer's _id for message comparison
        setMyId(conv.customer._id)
      }

      setConversation(conv)

      const { data: msgs } = await axios.get(
        `${API_URL}/api/chat/messages/${conv._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setMessages(msgs)

      // Mark as read
      await axios.put(
        `${API_URL}/api/chat/messages/${conv._id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
    } catch (error) {
      console.error("Error loading conversation:", error)
      alert("Error loading conversation: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleTyping = () => {
    if (!socket || !conversation) return

    const receiverId = user.role === "vendor" ? conversation.customer._id : conversation.vendor._id

    socket.emit("typing", {
      conversationId: conversation._id,
      receiverId,
    })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        conversationId: conversation._id,
        receiverId,
      })
    }, 2000)
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket || !conversation) return

    const receiverId = user.role === "vendor" ? conversation.customer._id : conversation.vendor._id

    socket.emit("send_message", {
      conversationId: conversation._id,
      content: newMessage.trim(),
      receiverId,
    })

    setNewMessage("")
    socket.emit("stop_typing", {
      conversationId: conversation._id,
      receiverId,
    })
  }

  if (loading) return <div className="p-8">Loading...</div>

  const otherParty = user.role === "vendor" ? conversation?.customer : conversation?.vendor
  const otherPartyName = otherParty?.businessName || otherParty?.name || "User"
  const otherPartyEmail = otherParty?.email || ""

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600">
          ← Back
        </button>
        <div>
          <h2 className="font-semibold">{otherPartyName}</h2>
          <p className="text-sm text-gray-500">{otherPartyEmail}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.sender?._id === myId
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  isMe ? "bg-blue-500 text-white" : "bg-white text-gray-800"
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg text-gray-500 text-sm">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value)
            handleTyping()
          }}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
