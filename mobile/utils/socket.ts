import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "../config/api";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io(API_CONFIG.SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log("Global socket connected");
    });

    socket.on("connect_error", (error) => {
      console.error("Global socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Global socket disconnected:", reason);
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const cleanupSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
