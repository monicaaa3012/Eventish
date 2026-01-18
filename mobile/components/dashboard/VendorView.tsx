import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router'; 
import { apiCall, API_CONFIG } from '../../config/api';

export default function VendorView() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ servicesCount: 0, bookingsCount: 0, rating: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchVendorDashboardData();
    }, [])
  );

  const fetchVendorDashboardData = async () => {
    try {
      // 1. Fetch Services
      const services = await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/my-services`);
      
      // 2. Fetch All Received Bookings
      const allBookings = await apiCall('/bookings/vendor/current');
      
      // 3. Fetch Vendor Profile (to get latest rating)
      const reviewsData = await apiCall('/vendors/my-reviews');
      
      // 4. Filter for 'Pending' for the stat count
      const pendingBookings = allBookings.filter((b: any) => b.status === 'Pending');
      
      setStats({
        servicesCount: services?.length || 0,
        bookingsCount: pendingBookings?.length || 0,
        rating: reviewsData?.rating || 0,
      });

      // 5. Take the 3 most recent bookings for the activity list
      setRecentBookings(allBookings.slice(0, 3));

    } catch (error) {
      console.error("Error fetching vendor stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendorDashboardData();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
    >
      <Text style={styles.title}>Vendor Dashboard</Text>
      
      {/* Dynamic Stats Row */}
      <View style={styles.statRow}>
        <TouchableOpacity 
          style={[styles.statBox, { backgroundColor: '#EEF2FF' }]}
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Text style={[styles.statNum, {color: '#4F46E5'}]}>{stats.bookingsCount}</Text>
          <Text style={styles.statLabel}>New Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statBox, { backgroundColor: '#FFFBEB' }]}
          onPress={() => router.push('/(vendor)/my-reviews')}
        >
           <Text style={[styles.statNum, {color: '#D97706'}]}>
            {stats.rating > 0 ? stats.rating.toFixed(1) : "N/A"}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {recentBookings.length === 0 ? (
        <View style={styles.emptyActivity}>
          <Text style={styles.emptyActivityText}>No recent booking activity</Text>
        </View>
      ) : (
        recentBookings.map((item) => (
          <TouchableOpacity 
            key={item._id} 
            style={styles.activityCard}
            onPress={() => router.push('/(tabs)/bookings')}
          >
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activityName}>{item.customerId?.name || 'Customer'}</Text>
              <Text style={styles.activityEvent}>{item.eventId?.title}</Text>
            </View>
            <Text style={styles.activityStatus}>{item.status}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Manage Business</Text>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/add-service')}>
          <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="add-circle-outline" size={22} color="#4F46E5" />
          </View>
          <Text style={styles.actionText}>Add New Service</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/my-services')}>
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="list-outline" size={22} color="#10B981" />
          </View>
          <Text style={styles.actionText}>View My Services</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(vendor)/my-reviews')}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="star-outline" size={22} color="#D97706" />
          </View>
          <Text style={styles.actionText}>Customer Reviews</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/update-profile')}>
          <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="business-outline" size={22} color="#374151" />
          </View>
          <Text style={styles.actionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// Helper for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return '#F59E0B';    // Orange
    case 'Accepted': return '#10B981';   // Green
    case 'Scheduled': return '#3B82F6';  // Blue
    case 'Booked': return '#6366F1';     // Indigo
    case 'In Progress': return '#4F46E5'; // Purple
    case 'Completed': return '#059669';  // Emerald
    case 'Rejected': return '#EF4444';   // Red
    default: return '#CBD5E1';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 60, color: '#111827' },
  statRow: { flexDirection: 'row', gap: 15 },
  statBox: { flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  statNum: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#6B7280', fontSize: 13, fontWeight: '600', marginTop: 4 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  seeAll: { color: '#4F46E5', fontWeight: '600' },
  
  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  activityName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  activityEvent: { fontSize: 13, color: '#6B7280' },
  activityStatus: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  emptyActivity: { padding: 20, alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
  emptyActivityText: { color: '#9CA3AF', fontSize: 14 },

  actionContainer: { gap: 12 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  actionText: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '600', color: '#111827' }
});