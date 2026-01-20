import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api';

export default function AdminVendorDetails() {
  const { id } = useLocalSearchParams();
  const [vendor, setVendor] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
    }
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor details and their services
      const [vendorData, servicesData] = await Promise.all([
        apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}/${id}`),
        apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}`).catch(() => [])
      ]);

      setVendor(vendorData);
      
      // Filter services for this vendor
      const allServices = Array.isArray(servicesData) ? servicesData : servicesData.services || [];
      const vendorServices = allServices.filter(
        (s: any) => s.createdBy && (s.createdBy === vendorData.userId?._id || s.createdBy._id === vendorData.userId?._id)
      );
      setServices(vendorServices);
      
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      Alert.alert("Error", "Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async () => {
    if (!vendor) return;
    
    const action = vendor.verified ? "unverify" : "verify";
    const message = vendor.verified 
      ? "Remove verification? This vendor will no longer be visible to customers."
      : "Verify this vendor? They will become visible to customers.";

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Vendor`,
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: vendor.verified ? "destructive" : "default",
          onPress: async () => {
            try {
              await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}/admin/verify/${vendor._id}`, {
                method: 'PUT',
                body: JSON.stringify({ verified: !vendor.verified })
              });
              
              setVendor({ ...vendor, verified: !vendor.verified });
              Alert.alert("Success", `Vendor ${action}ed successfully`);
            } catch (error: any) {
              Alert.alert("Error", error.message || `Failed to ${action} vendor`);
            }
          }
        }
      ]
    );
  };

  const toggleFeatured = async () => {
    if (!vendor) return;
    
    const action = vendor.featured ? "unfeature" : "feature";
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Vendor`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} this vendor?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}/admin/feature/${vendor._id}`, {
                method: 'PUT',
                body: JSON.stringify({ featured: !vendor.featured })
              });
              
              setVendor({ ...vendor, featured: !vendor.featured });
              Alert.alert("Success", `Vendor ${action}ed successfully`);
            } catch (error: any) {
              Alert.alert("Error", error.message || `Failed to ${action} vendor`);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Vendor not found</Text>
      </View>
    );
  }

  const profileImageUrl = vendor.profileImage ? getImageUrl(vendor.profileImage) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
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
          
          <Text style={styles.businessName}>{vendor.businessName}</Text>
          {vendor.companyName && (
            <Text style={styles.companyName}>{vendor.companyName}</Text>
          )}
          
          <View style={styles.badgeRow}>
            {vendor.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            )}
            {vendor.featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.badgeText}>Featured</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{vendor.rating || 0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{vendor.reviewCount || 0}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{services.length}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location" size={18} color="#64748B" />
            <Text style={styles.detailText}>{vendor.location || "No location"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="mail" size={18} color="#64748B" />
            <Text style={styles.detailText}>{vendor.userId?.email || "No email"}</Text>
          </View>
          
          {vendor.contactInfo?.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call" size={18} color="#64748B" />
              <Text style={styles.detailText}>{vendor.contactInfo.phone}</Text>
            </View>
          )}
          
          {vendor.contactInfo?.website && (
            <View style={styles.detailRow}>
              <Ionicons name="globe" size={18} color="#64748B" />
              <Text style={styles.detailText}>{vendor.contactInfo.website}</Text>
            </View>
          )}
          
          {vendor.priceRange && (
            <View style={styles.detailRow}>
              <Ionicons name="cash" size={18} color="#64748B" />
              <Text style={styles.detailText}>
                NPR {vendor.priceRange.min?.toLocaleString()} - {vendor.priceRange.max?.toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={18} color="#64748B" />
            <Text style={styles.detailText}>
              Joined: {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "Unknown"}
            </Text>
          </View>
        </View>

        {/* Description Section */}
        {(vendor.bio || vendor.description) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>
              {vendor.bio || vendor.description}
            </Text>
          </View>
        )}

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services ({services.length})</Text>
          {services.length > 0 ? (
            <View style={styles.servicesGrid}>
              {services.map((service: any, index: number) => (
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
                  <Text style={styles.serviceType}>{service.serviceType}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noServicesText}>No services added yet</Text>
          )}
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, vendor.verified ? styles.unverifyButton : styles.verifyButton]}
            onPress={toggleVerification}
          >
            <Ionicons 
              name={vendor.verified ? "close-circle" : "checkmark-circle"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {vendor.verified ? "Unverify Vendor" : "Verify Vendor"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, vendor.featured ? styles.unfeatureButton : styles.featureButton]}
            onPress={toggleFeatured}
          >
            <Ionicons 
              name={vendor.featured ? "star-outline" : "star"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.actionButtonText}>
              {vendor.featured ? "Remove Featured" : "Make Featured"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', fontSize: 16, marginTop: 16 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  scrollView: { flex: 1 },
  profileSection: { 
    alignItems: 'center', 
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16
  },
  imageContainer: { marginBottom: 16 },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  profileImagePlaceholder: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#F1F5F9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  businessName: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  companyName: { fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  verifiedBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ECFDF5', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  featuredBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FEF3C7', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  badgeText: { marginLeft: 4, fontSize: 12, fontWeight: '600' },
  statsSection: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16 
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  section: { 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16 
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailText: { marginLeft: 12, color: '#64748B', fontSize: 14, flex: 1 },
  descriptionText: { color: '#64748B', lineHeight: 20 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '48%', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12 },
  serviceImage: { width: '100%', height: 60, borderRadius: 6, marginBottom: 8 },
  serviceImagePlaceholder: { 
    width: '100%', 
    height: 60, 
    borderRadius: 6, 
    backgroundColor: '#E2E8F0', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  serviceTitle: { fontSize: 12, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  servicePrice: { fontSize: 11, color: '#4F46E5', fontWeight: '600' },
  serviceType: { fontSize: 10, color: '#64748B', marginTop: 2, textTransform: 'capitalize' },
  noServicesText: { color: '#94A3B8', fontStyle: 'italic' },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 12, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  verifyButton: { backgroundColor: '#10B981' },
  unverifyButton: { backgroundColor: '#EF4444' },
  featureButton: { backgroundColor: '#F59E0B' },
  unfeatureButton: { backgroundColor: '#64748B' },
  actionButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 }
});