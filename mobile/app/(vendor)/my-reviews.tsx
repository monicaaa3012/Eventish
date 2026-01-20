import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router, Stack } from 'expo-router'; // Add Stack here
import { apiCall } from '../../config/api';

interface Review {
  _id: string;
  user: { name: string; email: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function MyReviewsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    reviews: [] as Review[],
    rating: 0,
    reviewCount: 0,
    businessName: ''
  });

  const fetchReviews = async () => {
    try {
      const response = await apiCall('/vendors/my-reviews');
      setData({
        reviews: response.reviews || [],
        rating: response.averageRating || response.rating || 0,
        reviewCount: response.totalReviews || response.reviewCount || 0,
        businessName: response.businessName || ''
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user?.name || 'Anonymous'}</Text>
          <Text style={styles.reviewDate}>
            {/* Fix for "Invalid Date" */}
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* THIS HIDDEN COMPONENT REMOVES THE TOP-MOST HEADER */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Your Custom Styled Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ratings & Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={data.reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
        }
        ListHeaderComponent={
          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>Overall Rating</Text>
            <Text style={styles.statsNum}>{data.rating.toFixed(1)}</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons 
                  key={s} 
                  name={s <= Math.round(data.rating) ? "star" : "star-outline"} 
                  size={24} 
                  color="#FCD34D" 
                />
              ))}
            </View>
            <Text style={styles.countText}>Based on {data.reviewCount} reviews</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-ellipses-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>No reviews yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 15,
    paddingHorizontal: 15, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  listContent: { padding: 20, paddingBottom: 50 },
  statsCard: { 
    backgroundColor: '#4F46E5', 
    borderRadius: 24, 
    padding: 30, 
    alignItems: 'center', 
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 15
  },
  statsLabel: { color: '#E0E7FF', fontSize: 14, fontWeight: '600', marginBottom: 5 },
  statsNum: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  starRow: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  countText: { color: '#E0E7FF', fontSize: 13 },
  reviewCard: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#EEF2FF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 16 },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  reviewDate: { fontSize: 12, color: '#64748B' },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFBEB', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: 'bold', color: '#B45309' },
  commentText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#94A3B8', fontSize: 16, marginTop: 10 }
});