import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { AuthUtils } from '../../utils/auth';
import { API_CONFIG, apiCall } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id: conversationId, receiverId } = useLocalSearchParams();
  const router = useRouter();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const startChat = async () => {
      try {
        if (!conversationId) {
          setLoading(false);
          return;
        }

        const token = await AuthUtils.getToken();
        const userData = await AuthUtils.getUserData();
        
        if (!token || !userData) {
          console.error("No authentication data found");
          router.replace('/login');
          return;
        }
        
        const userId = userData.userId || null;
        setMyId(userId);

        const history = await apiCall(`/chat/history/${conversationId}`);
        setMessages(history || []);
        setLoading(false);

        const socketUrl = API_CONFIG.SERVER_URL;
        
        socketRef.current = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current.on("connect", () => {
          socketRef.current?.emit("join_conversation", conversationId);
        });

        socketRef.current.on("connect_error", (error) => {
          console.error("Socket connection error:", error.message);
        });

        socketRef.current.on("new_message", (newMsg) => {
          setMessages(prev => [...prev, newMsg]);
        });

        socketRef.current.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason);
        });

      } catch (error) {
        console.error("Chat Initialization Error:", error);
        setLoading(false);
      }
    };

    startChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId]);

  const onSend = () => {
    if (!message.trim() || !socketRef.current || !socketRef.current.connected) {
      return;
    }

    const payload = {
      conversationId,
      content: message.trim(),
      receiverId: receiverId
    };

    socketRef.current.emit("send_message", payload);
    setMessage('');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!conversationId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorText}>No conversation selected</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversation</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id || Math.random().toString()}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => {
            let isMe = false;
            
            if (item.sender) {
              if (typeof item.sender === 'string') {
                isMe = item.sender === myId;
              } else if (item.sender._id) {
                if (item.senderModel === 'Vendor') {
                  const senderUserId = typeof item.sender.userId === 'string' 
                    ? item.sender.userId 
                    : item.sender.userId?._id;
                  isMe = senderUserId === myId;
                } else {
                  isMe = item.sender._id === myId;
                }
              }
            }

            return (
              <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                  {item.content}
                </Text>
                <Text style={[styles.time, isMe ? styles.myTime : styles.theirTime]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.inputArea}>
          <TextInput 
            style={styles.input} 
            value={message} 
            onChangeText={setMessage} 
            placeholder="Type your message..." 
            multiline
          />
          <TouchableOpacity onPress={onSend} style={styles.sendBtn} disabled={!message.trim()}>
            <Ionicons name="send" size={24} color={message.trim() ? "#4F46E5" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#6B7280',
    marginBottom: 24
  },
  backButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 15, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  bubble: { 
    padding: 12, 
    borderRadius: 20, 
    marginVertical: 4, 
    marginHorizontal: 15, 
    maxWidth: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  myText: { color: '#fff' },
  theirText: { color: '#1F2937' },
  time: { fontSize: 10, marginTop: 4, opacity: 0.7 },
  myTime: { color: '#E0E7FF', textAlign: 'right' },
  theirTime: { color: '#6B7280', textAlign: 'left' },
  inputArea: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 25, 
    paddingHorizontal: 18, 
    paddingTop: 10, 
    paddingBottom: 10, 
    fontSize: 16,
    maxHeight: 100 
  },
  sendBtn: { marginLeft: 12, marginBottom: 8 }
});
