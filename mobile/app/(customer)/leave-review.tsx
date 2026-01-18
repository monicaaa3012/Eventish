import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiCall } from '../../config/api'; // Note: check path levels (../../)
import { Ionicons } from '@expo/vector-icons';

export default function LeaveReviewScreen() {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (bookingId) fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const data = await apiCall(`/bookings/${bookingId}`);
      if (data.status !== "Completed") {
        Alert.alert("Denied", "You can only review completed services.");
        router.back();
      }
      setBooking(data);
    } catch (error) {
      Alert.alert("Error", "Could not load booking details.");
      router.back();
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert("Error", "Please select a rating.");
    if (!comment.trim()) return Alert.alert("Error", "Please write a short comment.");

    try {
      setSubmitting(true);
      await apiCall(`/bookings/${bookingId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
      });

      Alert.alert("Success", "Review submitted!", [
        { text: "OK", onPress: () => router.replace('/(tabs)/bookings') }
      ]);
    } catch (error: any) {
      Alert.alert("Submission Failed", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBooking) return <ActivityIndicator style={{flex:1}} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Leave Review</Text>
         <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        <View style={styles.vendorCard}>
          <Text style={styles.vendorLabel}>Service by</Text>
          <Text style={styles.vendorName}>{booking?.vendorId?.businessName}</Text>
          <Text style={styles.eventName}>{booking?.eventId?.title}</Text>
        </View>

        <Text style={styles.label}>Rate your experience</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)}>
              <Ionicons 
                name={s <= rating ? "star" : "star-outline"} 
                size={40} 
                color={s <= rating ? "#F59E0B" : "#CBD5E1"} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Your Comment</Text>
        <TextInput
          style={styles.input}
          placeholder="What did you like or dislike?"
          multiline
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity 
          style={[styles.btn, submitting && {opacity: 0.7}]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.btnText}>{submitting ? "Submitting..." : "Submit Review"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 60, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  vendorCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 30, alignItems: 'center' },
  vendorLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  vendorName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  eventName: { fontSize: 14, color: '#4F46E5', marginTop: 4 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#334155' },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 30 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E2E8F0' },
  btn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 12, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});