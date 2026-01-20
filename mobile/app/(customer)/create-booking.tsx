import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, ActivityIndicator, Alert, TextInput 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

export default function CreateBookingScreen() {
  const { vendorId, businessName } = useLocalSearchParams();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const data = await apiCall(API_CONFIG.ENDPOINTS.EVENTS.MY_EVENTS);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Could not load your events. Please create an event first.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedEvent) {
      Alert.alert("Selection Required", "Please select one of your events.");
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        vendorId: vendorId,
        eventId: selectedEvent,
        message: message || "New booking request",
      };

      await apiCall(API_CONFIG.ENDPOINTS.BOOKINGS.BASE, {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });

      Alert.alert("Success", "Booking request sent to vendor!", [
        { 
          text: "View My Bookings", 
          onPress: () => router.replace("/(tabs)/bookings") 
        }
      ]);
    } catch (error: any) {
      Alert.alert("Booking Failed", error.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{flex: 1}} color="#4F46E5" />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book {businessName}</Text>
          <View style={{width: 28}} /> 
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Select Your Event</Text>
          {events.length === 0 ? (
            <TouchableOpacity 
              style={styles.noEventCard}
              onPress={() => router.push("/create-event")}
            >
              <Ionicons name="add-circle-outline" size={30} color="#64748B" />
              <Text style={styles.noEventText}>You have no active events. Click to create one.</Text>
            </TouchableOpacity>
          ) : (
            events.map((event: any) => (
              <TouchableOpacity 
                key={event._id}
                style={[
                  styles.eventCard, 
                  selectedEvent === event._id && styles.selectedCard
                ]}
                onPress={() => setSelectedEvent(event._id)}
              >
                <View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</Text>
                </View>
                {selectedEvent === event._id && (
                  <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>Message to Vendor (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your requirements..."
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleBooking}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Send Booking Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  eventCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    marginBottom: 10 
  },
  selectedCard: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF', borderWidth: 2 },
  eventTitle: { fontSize: 16, fontWeight: '600' },
  eventDate: { fontSize: 13, color: '#64748B', marginTop: 2 },
  noEventCard: { 
    padding: 30, 
    borderWidth: 1, 
    borderColor: '#CBD5E1', 
    borderStyle: 'dashed', 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  noEventText: { color: '#64748B', marginTop: 10, textAlign: 'center' },
  textArea: { 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 12, 
    height: 100, 
    textAlignVertical: 'top' 
  },
  submitBtn: { 
    backgroundColor: '#4F46E5', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 30 
  },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});