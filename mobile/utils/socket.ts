import { io, Socket } from "socket.io-client"
import { API_URL } from "../config/api"

let socket: Socket | null = null

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io(API_URL, {
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
