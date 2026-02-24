import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { getSocket, connectSocket, initializeSocket } from "../utils/socket"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function ChatPage() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(false)
  const [myUserId, setMyUserId] = useState(null) // Store the user's actual userId for comparison
  const [myRole, setMyRole] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  
  // Initialize socket with token
  useEffect(() => {
    if (token) {
      initializeSocket(token)
    }
  }, [token])

  const socket = getSocket()

  // vendorId param is actually the "other party" ID (vendor for customer, customer for vendor)
  const otherPartyId = vendorId

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    // Store user info for message comparison
    const userId = user.id || user._id
    setMyUserId(userId)
    setMyRole(user.role)

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
      } else {
        // Customer creating/getting conversation with vendor
        const { data } = await axios.post(
          `${API_URL}/api/chat/conversation/${otherPartyId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
        conv = data
      }

      setConversation(conv)

      // Fetch message history using new endpoint
      const { data: msgs } = await axios.get(
        `${API_URL}/api/chat/history/${conv._id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      
      setMessages(msgs || [])

      // Mark as read
      await axios.post(
        `${API_URL}/api/chat/mark-read/${conv._id}`,
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

  const handleBackToDashboard = () => {
    if (user.role === "admin") {
      navigate("/admin/dashboard")
    } else if (user.role === "vendor") {
      navigate("/vendor/dashboard")
    } else {
      navigate("/user/dashboard")
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
            ← Back
          </button>
          <div>
            <h2 className="font-semibold">{otherPartyName}</h2>
            <p className="text-sm text-gray-500">{otherPartyEmail}</p>
          </div>
        </div>
        <button 
          onClick={handleBackToDashboard}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Dashboard
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
          // Determine if this message was sent by me
          let isMe = false;
          let senderName = "Unknown";
          
          if (!msg.sender) {
            // No sender data at all
            senderName = "Unknown";
          } else if (typeof msg.sender === 'string') {
            // Sender is just an ID string (shouldn't happen with proper population)
            isMe = msg.sender === myUserId;
            senderName = isMe ? "You" : "Unknown User";
          } else {
            // Sender is populated object - use the data from backend
            if (msg.senderModel === 'Vendor') {
              // For vendor messages, the sender is the Vendor document
              // We need to compare the vendor's userId with myUserId
              const vendorUserId = msg.sender.userId?._id || msg.sender.userId;
              isMe = vendorUserId === myUserId;
              // Use businessName from the populated vendor object
              senderName = isMe ? "You" : (msg.sender.businessName || "Vendor");
            } else {
              // For user messages, the sender is the User document
              // Compare the user's _id with myUserId
              const userSenderId = msg.sender._id || msg.sender.id;
              isMe = userSenderId === myUserId;
              // Use name from the populated user object - NO FALLBACK to otherPartyName
              senderName = isMe ? "You" : (msg.sender.name || msg.sender.email || "User");
            }
          }

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                <span className={`text-xs font-medium mb-1 px-1 ${
                  isMe ? "text-blue-700" : "text-gray-600"
                }`}>
                  {senderName}
                </span>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    isMe 
                      ? "bg-blue-600 text-white rounded-br-sm" 
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    isMe ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl text-gray-500 text-sm border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t p-4 flex gap-3 shadow-lg">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value)
            handleTyping()
          }}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
        >
          Send
        </button>
      </form>
    </div>
  )
}
