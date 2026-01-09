import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api';
import { AuthUtils } from '../../utils/auth';

export default function CustomerView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 const fetchMyEvents = async () => {
  try {
    // 1. Add a token check before calling the API
    const token = await AuthUtils.getToken();
    
    if (!token) {
      console.log("Token not ready yet, skipping fetch...");
      // Optionally: setLoading(false) so the spinner stops
      return; 
    }

    const data = await apiCall(API_CONFIG.ENDPOINTS.EVENTS.MY_EVENTS);
    
    console.log("Fetched Events Count:", data?.length);

    if (Array.isArray(data)) {
      setEvents(data);
    } else {
      setEvents([]);
    }
  } catch (error: any) {
    // If the error is 'No token provided', it means AuthUtils failed
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

  const handlePlanEvent = () => {
    console.log("Attempting to navigate to: /(customer)/create-event");
    router.push('/(customer)/create-event');
  };

  const renderEventItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => router.push({ pathname: '/(customer)/event-details', params: { id: item._id } })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.eventType}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text style={styles.infoText}>
          {item.date ? new Date(item.date).toLocaleDateString() : 'No date set'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="cash-outline" size={16} color="#6B7280" />
        <Text style={styles.infoText}>
          Budget: ${item.budget ? item.budget.toLocaleString() : '0'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.welcomeText}>My Planner</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handlePlanEvent}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>New Event</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item: any) => item._id || Math.random().toString()}
          renderItem={renderEventItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-clear-outline" size={60} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Events Found</Text>
              <Text style={styles.emptySub}>Start planning your first big celebration!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  headerSection: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 40, 
    marginBottom: 25 
  },
  welcomeText: { fontSize: 28, fontWeight: '900', color: '#111827' },
  addButton: { 
    backgroundColor: '#4F46E5', 
    flexDirection: 'row', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  addButtonText: { color: '#fff', fontWeight: '700', marginLeft: 5 },
  eventCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'flex-start' },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginRight: 10 },
  typeBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { color: '#4F46E5', fontSize: 12, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { color: '#6B7280', marginLeft: 8, fontSize: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 20 },
  emptySub: { color: '#9CA3AF', marginTop: 8, textAlign: 'center' }
});