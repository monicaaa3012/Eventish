import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCall, API_CONFIG } from '../../config/api';

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${id}`);
      setEvent(data);

      const recData = await apiCall('/recommendations/jaccard', {
        method: 'POST',
        body: JSON.stringify({ eventIds: [id] })
      });
      setRecommendations(recData.recommendations || []);
    } catch (error: any) {
      Alert.alert("Error", "Could not load event details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Navigation */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{event.title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{event.eventType}</Text>
            </View>
          </View>

          <Text style={styles.description}>{event.description || "No description provided."}</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}><Ionicons name="calendar" size={20} color="#4F46E5" /><Text style={styles.infoText}>{new Date(event.date).toLocaleDateString()}</Text></View>
          <View style={styles.infoRow}><Ionicons name="location" size={20} color="#4F46E5" /><Text style={styles.infoText}>{event.location}</Text></View>
          <View style={styles.infoRow}><Ionicons name="cash" size={20} color="#4F46E5" /><Text style={styles.infoText}>Budget: NPR {event.budget?.toLocaleString()}</Text></View>
        </View>

        {/* AI Matches Section */}
        <View style={styles.matchHeader}>
          <Text style={styles.sectionTitle}>AI Top Matches</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/recommendations', params: { eventId: id } })}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {recommendations.length > 0 ? (
            recommendations.map((vendor) => (
              <TouchableOpacity 
                key={vendor._id} 
                style={styles.vendorMiniCard}
                onPress={() => router.push({ pathname: '/vendor-details', params: { id: vendor._id } })}
              >
                <View style={styles.matchCircle}>
                  <Text style={styles.matchPercentText}>{Math.round(vendor.similarity * 100)}%</Text>
                </View>
                <Text style={styles.vendorMiniName} numberOfLines={1}>{vendor.businessName}</Text>
                <Text style={styles.vendorMiniService}>{vendor.services?.[0] || 'Vendor'}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Analyzing requirements...</Text>
          )}
        </ScrollView>

        <Text style={styles.sectionTitle}>Requirements</Text>
        <View style={styles.requirementsContainer}>
          {event.requirements?.map((req: string, index: number) => (
            <View key={index} style={styles.reqChip}>
              <Ionicons name="checkmark-circle" size={16} color="#4F46E5" />
              <Text style={styles.reqText}>{req}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => Alert.alert("Delete", "Remove this event?", [{text: "No"}, {text: "Yes", onPress: async () => { await apiCall(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${id}`, { method: 'DELETE' }); router.replace('/(tabs)'); }}])}
        >
          <Text style={styles.deleteText}>Cancel Event</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginHorizontal: 20, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', flex: 1 },
  badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: '#4F46E5', fontWeight: '700', fontSize: 12 },
  description: { fontSize: 16, color: '#4B5563', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoText: { marginLeft: 12, fontSize: 16, color: '#374151', fontWeight: '500' },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginVertical: 15 },
  viewAllText: { color: '#4F46E5', fontWeight: '600' },
  horizontalScroll: { paddingLeft: 20, marginBottom: 10 },
  vendorMiniCard: { backgroundColor: '#fff', width: 130, padding: 15, borderRadius: 16, marginRight: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  matchCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  matchPercentText: { fontSize: 11, fontWeight: '800', color: '#4F46E5' },
  vendorMiniName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  vendorMiniService: { fontSize: 10, color: '#6B7280', textTransform: 'capitalize' },
  requirementsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  reqChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  reqText: { marginLeft: 8, color: '#374151', fontWeight: '600' },
  emptyText: { color: '#9CA3AF', paddingHorizontal: 20 },
  deleteButton: { marginTop: 40, padding: 18, alignItems: 'center' },
  deleteText: { color: '#EF4444', fontWeight: '700' },
});