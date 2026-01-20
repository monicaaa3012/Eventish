import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api';
import { AuthUtils } from '../../utils/auth';

export default function CustomerView() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyEvents = async () => {
    try {
      const token = await AuthUtils.getToken();
      if (!token) return; 

      const data = await apiCall(API_CONFIG.ENDPOINTS.EVENTS.MY_EVENTS);
      
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch events:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyEvents();
  };

  const renderEventItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => router.push({ pathname: '/(customer)/event-details', params: { id: item._id } })}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventLocation}>{item.location || 'No location set'}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.eventType}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>
            {item.date ? new Date(item.date).toLocaleDateString() : 'TBD'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="wallet-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>
            NPR {item.budget ? item.budget.toLocaleString() : '0'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.welcomeText}>My Planner</Text>
          <Text style={styles.subWelcome}>{events.length} active events</Text>
        </View>
        
        <View style={styles.actionButtons}>
          {/* AI RECOMMENDATIONS BUTTON */}
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={() => router.push('/recommendations')}
          >
            <Ionicons name="sparkles" size={20} color="#4F46E5" />
          </TouchableOpacity>

          {/* ADD EVENT BUTTON */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(customer)/create-event')}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item: any) => item._id || Math.random().toString()}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-clear-outline" size={40} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>Your planner is empty</Text>
              <Text style={styles.emptySub}>Create an event to start getting AI-powered vendor matches.</Text>
              <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={() => router.push('/(customer)/create-event')}
              >
                <Text style={styles.emptyBtnText}>Start Planning</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  welcomeText: { fontSize: 26, fontWeight: '800', color: '#111827' },
  subWelcome: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  aiButton: { 
    backgroundColor: '#EEF2FF', 
    padding: 10, 
    borderRadius: 12, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  addButton: { 
    backgroundColor: '#4F46E5', 
    padding: 8, 
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  listContent: { padding: 20, paddingBottom: 100 },
  eventCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  eventLocation: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  typeBadge: { backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, height: 26 },
  typeText: { color: '#7C3AED', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginBottom: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { color: '#4B5563', marginLeft: 6, fontSize: 13, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151' },
  emptySub: { color: '#9CA3AF', marginTop: 10, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: 25, backgroundColor: '#4F46E5', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700' }
});