import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { getSocket, connectSocket } from "../utils/socket"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export default function ConversationsList() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const socket = getSocket()

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    loadConversations()
    connectSocket()

    if (socket) {
      socket.on("conversation_update", ({ conversationId, lastMessage }) => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId
              ? { ...conv, lastMessage, lastMessageAt: new Date() }
              : conv,
          ),
        )
      })
    }

    return () => {
      socket?.off("conversation_update")
    }
  }, [])

  const loadConversations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConversations(data)
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getOtherParty = (conv) => {
    return user.role === "vendor" ? conv.customer : conv.vendor
  }

  const getUnreadCount = (conv) => {
    return user.role === "vendor"
      ? conv.unreadCount?.vendor || 0
      : conv.unreadCount?.customer || 0
  }

  const handleBackToDashboard = () => {
    if (user.role === "admin") {
      navigate("/admin/dashboard")
    } else if (user.role === "vendor") {
      navigate("/vendor/dashboard")
    } else {
      navigate("/user/dashboard")
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <button 
          onClick={handleBackToDashboard}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {user.role === "vendor"
            ? "No conversations yet. Customers will appear here when they message you."
            : "No conversations yet. Start chatting with vendors!"}
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = getOtherParty(conv)
            const unread = getUnreadCount(conv)

            return (
              <div
                key={conv._id}
                onClick={() =>
                  navigate(
                    `/chat/${user.role === "vendor" ? conv.customer._id : conv.vendor._id}`,
                  )
                }
                className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {other?.businessName || other?.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                    {unread > 0 && (
                      <span className="inline-block mt-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
