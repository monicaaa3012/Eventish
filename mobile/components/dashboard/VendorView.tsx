import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api';

export default function VendorView() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ servicesCount: 0, bookingsCount: 0 });

  useEffect(() => {
    fetchVendorStats();
  }, []);

  const fetchVendorStats = async () => {
    try {
      // Fetching services created by this vendor
      const services = await apiCall(API_CONFIG.ENDPOINTS.SERVICES.VENDOR);
      setStats({
        servicesCount: services?.length || 0,
        bookingsCount: 0, // Placeholder until you build bookings
      });
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Vendor Dashboard</Text>
      
      {/* Stats Section */}
      <View style={styles.statRow}>
        <View style={[styles.statBox, { backgroundColor: '#EEF2FF' }]}>
          <Text style={[styles.statNum, {color: '#4F46E5'}]}>{stats.bookingsCount}</Text>
          <Text style={styles.statLabel}>New Bookings</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#ECFDF5' }]}>
          {loading ? (
            <ActivityIndicator size="small" color="#10B981" />
          ) : (
            <Text style={[styles.statNum, {color: '#10B981'}]}>{stats.servicesCount}</Text>
          )}
          <Text style={styles.statLabel}>Services</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Manage Business</Text>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(vendor)/update-profile')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="business-outline" size={24} color="#374151" />
          </View>
          <Text style={styles.actionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(vendor)/add-service')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="add-circle-outline" size={24} color="#4F46E5" />
          </View>
          <Text style={styles.actionText}>Add New Service</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(vendor)/my-services')} 
        >
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="list-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.actionText}>View My Services</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 30, marginBottom: 15 },
  statRow: { flexDirection: 'row', gap: 15 },
  statBox: { flex: 1, padding: 20, borderRadius: 16, alignItems: 'center', elevation: 1 },
  statNum: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  actionContainer: { gap: 12 },
  actionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  actionText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600', color: '#111827' }
});