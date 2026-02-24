import { io } from "socket.io-client"

let socket = null

export const initializeSocket = (token) => {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"
    
    socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    })

    socket.on("connect", () => {
      console.log("✅ Socket connected")
    })

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message)
    })

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason)
    })
  }
  return socket
}

export const getSocket = () => socket

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect()
  }
}

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

export const cleanupSocket = () => {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}
