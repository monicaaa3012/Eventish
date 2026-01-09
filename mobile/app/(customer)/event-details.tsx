import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, API_CONFIG } from '../../config/api';

export default function EventDetails() {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEventDetails = async () => {
    try {
      // Calls your getEventById controller
      const data = await apiCall(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${id}`);
      setEvent(data);
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{event.eventType}</Text>
          </View>
        </View>

        <Text style={styles.description}>{event.description || "No description provided."}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            {new Date(event.date).toLocaleDateString(undefined, { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>{event.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>Budget: ${event.budget?.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Requirements</Text>
      <View style={styles.requirementsContainer}>
        {event.requirements?.length > 0 ? (
          event.requirements.map((req: string, index: number) => (
            <View key={index} style={styles.reqChip}>
              <Ionicons name="checkmark-circle" size={16} color="#4F46E5" />
              <Text style={styles.reqText}>{req}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No specific requirements listed.</Text>
        )}
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                await apiCall(`${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${id}`, { method: 'DELETE' });
                router.replace('/(tabs)');
            }}
          ]);
        }}
      >
        <Text style={styles.deleteText}>Cancel Event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', flex: 1, marginRight: 10 },
  badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { color: '#4F46E5', fontWeight: '700', fontSize: 12 },
  description: { fontSize: 16, color: '#4B5563', lineHeight: 24, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoText: { marginLeft: 12, fontSize: 16, color: '#374151', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 30, marginBottom: 15 },
  requirementsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reqChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  reqText: { marginLeft: 8, color: '#374151', fontWeight: '600' },
  emptyText: { color: '#9CA3AF', fontStyle: 'italic' },
  deleteButton: { marginTop: 40, padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 50 },
  deleteText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});