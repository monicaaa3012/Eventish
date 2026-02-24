import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCall } from '../../config/api';
import { AuthUtils } from '../../utils/auth';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesInbox() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      const userData = await AuthUtils.getUserData();
      const role = await AuthUtils.getRole();
      setCurrentUserId(userData?.userId || null);
      setCurrentUserRole(role);
      
      // Fetches the list of conversations for the logged-in user
      const response = await apiCall('/chat/conversations'); 
      setConversations(response);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const renderConversation = ({ item }: { item: any }) => {
    // Determine the "Other User" to display their name
    // If current user is vendor, show customer name. If customer, show vendor name.
    const isVendor = currentUserRole === 'vendor';
    const otherUser = isVendor ? item.customer : item.vendor;
    const displayName = isVendor 
      ? (otherUser?.name || "Customer") 
      : (otherUser?.businessName || "Vendor");

    // For receiverId, we need the actual user ID
    let receiverId;
    if (isVendor) {
      // Vendor messaging customer - use customer's _id (which is their userId)
      receiverId = otherUser?._id;
    } else {
      // Customer messaging vendor - use vendor's userId if available, otherwise vendor's _id
      receiverId = otherUser?.userId || otherUser?._id;
    }

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/chat/[id]',
          params: { 
            id: item._id, 
            receiverId: receiverId
          }
        })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.time}>
              {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleDateString() : ''}
            </Text>
          </View>
          
          <Text style={styles.lastMsg} numberOfLines={1}>
            {item.lastMessage || "Start a conversation..."}
          </Text>
        </View>

        {/* Unread Indicator */}
        {((isVendor && item.unreadCount?.vendor > 0) || (!isVendor && item.unreadCount?.customer > 0)) && (
          <View style={styles.badge} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  card: { 
    flexDirection: 'row', 
    padding: 15, 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F9FAFB' 
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#EEF2FF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#4F46E5', fontWeight: '700', fontSize: 18 },
  content: { flex: 1, marginLeft: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  time: { fontSize: 12, color: '#9CA3AF' },
  lastMsg: { fontSize: 14, color: '#6B7280' },
  badge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4F46E5', marginLeft: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#9CA3AF', fontSize: 16 }
});