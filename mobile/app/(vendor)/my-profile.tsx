import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api';

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalReviews: 0,
    averageRating: 0
  });

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile, services, and reviews in parallel
      const [profile, servicesData, reviewsData, bookingsData] = await Promise.all([
        apiCall(API_CONFIG.ENDPOINTS.VENDORS.ME),
        apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/my-services`).catch(() => []),
        apiCall('/vendors/my-reviews').catch(() => ({ reviews: [], rating: 0, reviewCount: 0 })),
        apiCall('/bookings/vendor/current').catch(() => [])
      ]);

      setProfileData(profile);
      setServices(servicesData || []);
      
      // Calculate stats
      const completedBookings = bookingsData.filter((b: any) => b.status === 'Completed').length;
      setStats({
        totalBookings: bookingsData.length || 0,
        completedBookings,
        totalReviews: reviewsData.reviewCount || 0,
        averageRating: reviewsData.rating || 0
      });

    } catch (error: any) {
      console.error("Profile fetch error:", error);
      Alert.alert("Error", "Could not load profile data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.centered}>
        <Ionicons name="person-outline" size={64} color="#CBD5E1" />
        <Text style={styles.emptyText}>Profile not found</Text>
        <TouchableOpacity 
          style={styles.setupButton}
          onPress={() => router.push('/(vendor)/update-profile')}
        >
          <Text style={styles.setupButtonText}>Set Up Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profileImageUrl = profileData.profileImage ? getImageUrl(profileData.profileImage) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
      >
        {/* Header with Edit Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/(vendor)/update-profile')}
          >
            <Ionicons name="create-outline" size={20} color="#4F46E5" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Image and Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="business" size={40} color="#94A3B8" />
              </View>
            )}
          </View>
          
          <Text style={styles.businessName}>{profileData.businessName || "Business Name"}</Text>
          {profileData.companyName && (
            <Text style={styles.companyName}>{profileData.companyName}</Text>
          )}
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="#64748B" />
            <Text style={styles.locationText}>{profileData.location || "Location not set"}</Text>
          </View>

          {profileData.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified Vendor</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.completedBookings}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* About Section */}
        {(profileData.bio || profileData.description) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              {profileData.bio || profileData.description || "No description available"}
            </Text>
          </View>
        )}

        {/* Price Range */}
        {profileData.priceRange && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <Text style={styles.priceText}>
              NPR {profileData.priceRange.min?.toLocaleString()} - {profileData.priceRange.max?.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Contact Information */}
        {profileData.contactInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {profileData.contactInfo.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call" size={18} color="#64748B" />
                <Text style={styles.contactText}>{profileData.contactInfo.phone}</Text>
              </View>
            )}
            
            {profileData.contactInfo.email && (
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={18} color="#64748B" />
                <Text style={styles.contactText}>{profileData.contactInfo.email}</Text>
              </View>
            )}
            
            {profileData.contactInfo.website && (
              <View style={styles.contactRow}>
                <Ionicons name="globe" size={18} color="#64748B" />
                <Text style={styles.contactText}>{profileData.contactInfo.website}</Text>
              </View>
            )}
          </View>
        )}

        {/* Services Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Services</Text>
            <TouchableOpacity onPress={() => router.push('/(vendor)/my-services')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {services.length > 0 ? (
            <View style={styles.servicesGrid}>
              {services.slice(0, 4).map((service: any, index: number) => (
                <View key={service._id || index} style={styles.serviceCard}>
                  {service.images && service.images[0] ? (
                    <Image 
                      source={{ uri: getImageUrl(service.images[0]) }} 
                      style={styles.serviceImage} 
                    />
                  ) : (
                    <View style={styles.serviceImagePlaceholder}>
                      <Ionicons name="image-outline" size={20} color="#94A3B8" />
                    </View>
                  )}
                  <Text style={styles.serviceTitle} numberOfLines={2}>
                    {service.title || service.description}
                  </Text>
                  <Text style={styles.servicePrice}>NPR {service.price?.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyServices}>
              <Ionicons name="add-circle-outline" size={32} color="#94A3B8" />
              <Text style={styles.emptyServicesText}>No services added yet</Text>
              <TouchableOpacity 
                style={styles.addServiceButton}
                onPress={() => router.push('/(vendor)/add-service')}
              >
                <Text style={styles.addServiceButtonText}>Add Your First Service</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(vendor)/my-services')}
            >
              <Ionicons name="list" size={24} color="#4F46E5" />
              <Text style={styles.actionText}>Manage Services</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(vendor)/my-reviews')}
            >
              <Ionicons name="star" size={24} color="#F59E0B" />
              <Text style={styles.actionText}>View Reviews</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/bookings')}
            >
              <Ionicons name="calendar" size={24} color="#10B981" />
              <Text style={styles.actionText}>My Bookings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(vendor)/add-service')}
            >
              <Ionicons name="add-circle" size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, paddingBottom: 0 },
  editButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editButtonText: { marginLeft: 6, color: '#4F46E5', fontWeight: '600' },
  profileSection: { alignItems: 'center', padding: 20 },
  imageContainer: { marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  profileImagePlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  businessName: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  companyName: { fontSize: 16, color: '#64748B', marginTop: 4, textAlign: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { marginLeft: 4, color: '#64748B', fontSize: 14 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12 },
  verifiedText: { marginLeft: 4, color: '#10B981', fontWeight: '600', fontSize: 12 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' },
  section: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  viewAllText: { color: '#4F46E5', fontWeight: '600' },
  aboutText: { color: '#64748B', lineHeight: 22 },
  priceText: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  contactText: { marginLeft: 8, color: '#64748B', fontSize: 14 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '48%', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  serviceImage: { width: '100%', height: 80, borderRadius: 8, marginBottom: 8 },
  serviceImagePlaceholder: { width: '100%', height: 80, borderRadius: 8, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  serviceTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  servicePrice: { fontSize: 12, color: '#4F46E5', fontWeight: '600' },
  emptyServices: { alignItems: 'center', padding: 20 },
  emptyServicesText: { color: '#94A3B8', marginTop: 8, marginBottom: 16 },
  addServiceButton: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  addServiceButtonText: { color: '#fff', fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '48%', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12 },
  actionText: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#64748B', textAlign: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 16, marginTop: 16, marginBottom: 20 },
  setupButton: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  setupButtonText: { color: '#fff', fontWeight: '600' }
});