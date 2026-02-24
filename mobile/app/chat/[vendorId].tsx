import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_URL } from "../../config/api"
import { getSocket, connectSocket } from "../../utils/socket"

export default function ChatScreen() {
  const { vendorId } = useLocalSearchParams()
  const router = useRouter()
  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const typingTimeoutRef = useRef<any>(null)

  const socket = getSocket()

  useEffect(() => {
    loadConversation()
    connectSocket()
  }, [vendorId])

  useEffect(() => {
    if (!socket || !conversation) return

    socket.emit("join_conversation", conversation._id)

    socket.on("new_message", (message: any) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("user_typing", ({ conversationId }: any) => {
      if (conversationId === conversation._id) setTyping(true)
    })

    socket.on("user_stop_typing", ({ conversationId }: any) => {
      if (conversationId === conversation._id) setTyping(false)
    })

    return () => {
      socket.off("new_message")
      socket.off("user_typing")
      socket.off("user_stop_typing")
    }
  }, [socket, conversation])
