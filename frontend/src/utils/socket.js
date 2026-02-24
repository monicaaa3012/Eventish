import { io } from "socket.io-client"

let socket = null

export const initializeSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      autoConnect: false,
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
  if (socket) {
    socket.disconnect()
  }
}
