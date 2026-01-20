import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiCall } from '../../config/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface Booking {
  _id: string;
  status: string;
  message?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  servicePrice?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  vendorId?: { _id: string; businessName: string };
  customerId?: { _id: string; name: string; email: string };
  eventId: { title: string; date: string; location: string };
  createdAt: string;
}

const BookingScreen = () => {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Scheduling Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  // 1. Initialize Auth and set Role-based View
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const role = await AsyncStorage.getItem('role');
        setUserRole(role);
        
        // Redirect admins away from bookings screen
        if (role?.toLowerCase() === 'admin') {
          router.replace('/(tabs)');
          return;
        }
        
        setIsReady(true);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    initializeAuth();
  }, []);

  // 2. Fetch Bookings based on Role
  useEffect(() => {
    if (isReady) {
      fetchBookings();
    }
  }, [isReady]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const endpoint = userRole === 'vendor' 
        ? '/bookings/vendor/current' 
        : '/bookings/customer';
        
      const data = await apiCall(endpoint);
      setBookings(data);
    } catch (error: any) {
      console.log("Fetch Error:", error.message);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, extraData = {}) => {
    try {
      await apiCall(`/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, ...extraData })
      });
      Alert.alert("Success", `Booking status updated to ${status}`);
      fetchBookings();
      setShowScheduleModal(false);
      setDateInput('');
      setTimeInput('');
    } catch (error) {
      Alert.alert("Error", "Update failed");
    }
  };

  const handlePayment = (id: string) => {
    Alert.alert(
      "Payment Method",
      "Choose your advance payment method",
      [
        { text: "Cash", onPress: () => confirmPayment(id, 'cash') },
        { text: "eSewa", onPress: () => Alert.alert("Coming Soon", "eSewa integration is next!") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const confirmPayment = async (id: string, method: string) => {
    try {
      await apiCall(`/bookings/${id}/confirm-vendor`, {
        method: 'PUT',
        body: JSON.stringify({ paymentMethod: method })
      });
      fetchBookings();
    } catch (error) {
      Alert.alert("Error", "Payment confirmation failed");
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.eventTitle}>
          {userRole === 'vendor' 
            ? (item.customerId?.name || 'New Request') 
            : (item.vendorId?.businessName || 'Vendor')}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.eventSubTitle}>Event: {item.eventId?.title}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={14} color="#64748B" />
        <Text style={styles.detailText}>
          {item.eventId?.date ? new Date(item.eventId.date).toLocaleDateString() : 'No date'}
        </Text>
      </View>
      
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={14} color="#64748B" />
        <Text style={styles.detailText}>{item.eventId?.location || 'No location'}</Text>
      </View>

      {item.message && (
        <Text style={styles.messageText}>Note: "{item.message}"</Text>
      )}

      {item.scheduledDate && (
        <View style={styles.scheduleBox}>
          <Text style={styles.scheduleTitle}>Scheduled for:</Text>
          <Text style={styles.scheduleTime}>
            {new Date(item.scheduledDate).toLocaleDateString()} at {item.scheduledTime || 'N/A'}
          </Text>
        </View>
      )}

      <View style={styles.actionRow}>
        {/* VENDOR ACTIONS */}
        {userRole === 'vendor' && (
          <>
            {item.status === 'Pending' && (
              <>
                <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={() => updateStatus(item._id, 'Accepted')}>
                  <Text style={styles.btnTextWhite}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => updateStatus(item._id, 'Rejected')}>
                  <Text style={styles.btnTextWhite}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
            
            {item.status === 'Accepted' && (
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => {
                setSelectedBooking(item);
                setShowScheduleModal(true);
              }}>
                <Text style={styles.btnTextWhite}>Set Schedule</Text>
              </TouchableOpacity>
            )}

            {item.status === 'Booked' && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#4F46E5' }]} onPress={() => updateStatus(item._id, 'In Progress')}>
                <Text style={styles.btnTextWhite}>Start Service</Text>
              </TouchableOpacity>
            )}

            {item.status === 'In Progress' && (
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#10B981' }]} onPress={() => updateStatus(item._id, 'Completed')}>
                <Text style={styles.btnTextWhite}>Mark Completed</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* CUSTOMER ACTIONS */}
        {userRole !== 'vendor' && (
          <>
            {item.status === 'Scheduled' && (
              <TouchableOpacity style={[styles.btn, styles.btnConfirm]} onPress={() => handlePayment(item._id)}>
                <Text style={styles.btnTextWhite}>Confirm & Pay Advance</Text>
              </TouchableOpacity>
            )}

            {item.status === 'Completed' && (
              <TouchableOpacity 
                style={[styles.btn, { backgroundColor: '#F59E0B' }]} 
                onPress={() => router.push({
                  pathname: '/leave-review',
                  params: { 
                    vendorId: item.vendorId?._id, 
                    bookingId: item._id, 
                    businessName: item.vendorId?.businessName 
                  }
                })}
              >
                <Ionicons name="star" size={16} color="#fff" />
                <Text style={[styles.btnTextWhite, {marginLeft: 8}]}>Leave Review</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Admin Access Protection */}
      {userRole?.toLowerCase() === 'admin' ? (
        <View style={styles.accessDenied}>
          <Ionicons name="shield-outline" size={64} color="#EF4444" />
          <Text style={styles.accessDeniedText}>Access Restricted</Text>
          <Text style={styles.accessDeniedSubtext}>Bookings are not available for admin users</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {userRole === 'vendor' ? 'Received Bookings' : 'My Bookings'}
            </Text>
            <TouchableOpacity onPress={fetchBookings} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {!isReady || loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{marginTop: 50}} />
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item._id}
              renderItem={renderBookingItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>No bookings found.</Text>
            </View>
          }
        />
      )}

      <Modal visible={showScheduleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Service</Text>
            <Text style={styles.inputLabel}>Date</Text>
            <TextInput placeholder="YYYY-MM-DD" style={styles.input} value={dateInput} onChangeText={setDateInput} />
            <Text style={styles.inputLabel}>Time</Text>
            <TextInput placeholder="e.g. 10:00 AM" style={styles.input} value={timeInput} onChangeText={setTimeInput} />
            <TouchableOpacity 
              style={styles.btnSubmit} 
              onPress={() => updateStatus(selectedBooking!._id, 'Scheduled', { scheduledDate: dateInput, scheduledTime: timeInput })}
            >
              <Text style={styles.btnTextWhite}>Confirm Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowScheduleModal(false)} style={styles.btnCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        </>
      )}
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return '#F59E0B';
    case 'Accepted': return '#10B981';
    case 'Scheduled': return '#3B82F6';
    case 'Booked': return '#6366F1';
    case 'In Progress': return '#4F46E5';
    case 'Completed': return '#059669';
    case 'Rejected': return '#EF4444';
    default: return '#64748B';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  accessDenied: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  accessDeniedText: { fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginTop: 16, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  refreshBtn: { padding: 8, backgroundColor: '#EEF2FF', borderRadius: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', flex: 1 },
  eventSubTitle: { fontSize: 14, fontWeight: '600', color: '#4F46E5', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 6 },
  detailText: { fontSize: 14, color: '#64748B' },
  messageText: { fontSize: 13, color: '#64748B', fontStyle: 'italic', marginTop: 8, backgroundColor: '#F1F5F9', padding: 8, borderRadius: 8 },
  scheduleBox: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginVertical: 12, borderWidth: 1, borderColor: '#BFDBFE' },
  scheduleTitle: { fontWeight: '700', color: '#1D4ED8', fontSize: 12, marginBottom: 2 },
  scheduleTime: { color: '#1E3A8A', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  btnPrimary: { backgroundColor: '#4F46E5' },
  btnAccept: { backgroundColor: '#10B981' },
  btnReject: { backgroundColor: '#EF4444' },
  btnConfirm: { backgroundColor: '#3B82F6' },
  btnTextWhite: { color: '#fff', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94A3B8', fontSize: 16, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputLabel: { fontSize: 14, color: '#64748B', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  btnSubmit: { backgroundColor: '#4F46E5', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnCancel: { marginTop: 16, alignItems: 'center' },
  cancelText: { color: '#EF4444', fontWeight: '600' }
});

export default BookingScreen;