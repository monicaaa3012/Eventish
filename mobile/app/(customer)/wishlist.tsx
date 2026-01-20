import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, getImageUrl } from '../../config/api';

export default function WishlistScreen() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlistData = async () => {
    try {
      const response = await apiCall('/recommendations/wishlist');
      if (response.success) {
        setWishlistItems(response.wishlist || []);
      }
    } catch (error) {
      console.error("Wishlist Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const removeItem = async (id: string) => {
    try {
      // Optimistic Update: remove from UI immediately
      const previousItems = [...wishlistItems];
      setWishlistItems(prev => prev.filter(item => item._id !== id));
      
      await apiCall(`/recommendations/wishlist/${id}`, { method: 'POST' });
    } catch (err) {
      Alert.alert("Error", "Could not remove vendor.");
      fetchWishlistData(); // Rollback if API fails
    }
  };

  const handleClearAll = () => {
    if (wishlistItems.length === 0) return;

    Alert.alert(
      "Clear Wishlist",
      "Are you sure you want to remove all saved vendors?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: async () => {
            try {
              // Note: If you have a 'clear-all' endpoint, use that instead of a loop
              for (const item of wishlistItems) {
                await apiCall(`/recommendations/wishlist/${item._id}`, { method: 'POST' });
              }
              setWishlistItems([]);
            } catch (err) {
              Alert.alert("Error", "Failed to clear wishlist fully.");
              fetchWishlistData();
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const imageUrl = item.displayImage ? getImageUrl(item.displayImage) : null;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({ pathname: '/(customer)/vendor-details', params: { id: item._id } })}
      >
        <View style={styles.imageBox}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="images-outline" size={28} color="#CBD5E1" />
            </View>
          )}
        </View>

        <View style={styles.details}>
          <Text style={styles.categoryText}>
            {item.serviceType ? item.serviceType.toUpperCase() : 'VENDOR'}
          </Text>
          <Text style={styles.businessName} numberOfLines={1}>{item.businessName}</Text>
          
          {/* FIXED: Changed <div> to <View> */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#64748B" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price Range</Text>
            <Text style={styles.priceValue}>
              {item.minPrice && item.maxPrice 
                ? `NPR ${item.minPrice.toLocaleString()} - ${item.maxPrice.toLocaleString()}`
                : 'Price not available'}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.heartBtn}>
          <Ionicons name="heart" size={24} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Saved Vendors</Text>
        
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={[styles.clearText, wishlistItems.length === 0 && { color: '#CBD5E1' }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#4F46E5" size="large" /></View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchWishlistData} tintColor="#4F46E5" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-outline" size={40} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptySub}>Explore vendors and save your favorites here.</Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(customer)/explore')}>
                <Text style={styles.exploreBtnText}>Explore Vendors</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  clearText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  list: { padding: 20, paddingBottom: 40 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 12, 
    marginBottom: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  imageBox: { width: 95, height: 95, borderRadius: 18, overflow: 'hidden', backgroundColor: '#F1F5F9' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  details: { flex: 1, marginLeft: 15 },
  categoryText: { fontSize: 10, color: '#4F46E5', fontWeight: '800', marginBottom: 2, letterSpacing: 0.5 },
  businessName: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  locationText: { fontSize: 12, color: '#64748B', marginLeft: 4, fontWeight: '500' },
  priceContainer: { marginTop: 4 },
  priceLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  priceValue: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginTop: 1 },
  heartBtn: { padding: 8, alignSelf: 'flex-start' },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  emptySub: { color: '#64748B', marginTop: 10, textAlign: 'center', lineHeight: 22 },
  exploreBtn: { marginTop: 25, backgroundColor: '#4F46E5', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16 },
  exploreBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});