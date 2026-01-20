import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api';

export default function AdminView() {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [verifiedVendors, setVerifiedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Get all vendors including unverified ones
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}?includeUnverified=true`);
      const allVendors = Array.isArray(response) ? response : response.vendors || [];
      
      // Separate pending and verified vendors
      const unverified = allVendors.filter((vendor: any) => !vendor.verified);
      const verified = allVendors.filter((vendor: any) => vendor.verified);
      
      setPendingVendors(unverified);
      setVerifiedVendors(verified);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      Alert.alert("Error", "Failed to load vendor data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendors();
  };

  const verifyVendor = async (vendorId: string, businessName: string) => {
    Alert.alert(
      "Verify Vendor",
      `Verify "${businessName}"? This will make them visible to customers.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: async () => {
            try {
              await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}/admin/verify/${vendorId}`, {
                method: 'PUT',
                body: JSON.stringify({ verified: true })
              });
              
              Alert.alert("Success", "Vendor verified successfully");
              fetchVendors(); // Refresh the list
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to verify vendor");
            }
          }
        }
      ]
    );
  };

  const unverifyVendor = async (vendorId: string, businessName: string) => {
    Alert.alert(
      "Unverify Vendor",
      `Remove verification from "${businessName}"? They will no longer be visible to customers.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unverify",
          style: "destructive",
          onPress: async () => {
            try {
              await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}/admin/verify/${vendorId}`, {
                method: 'PUT',
                body: JSON.stringify({ verified: false })
              });
              
              Alert.alert("Success", "Vendor unverified successfully");
              fetchVendors(); // Refresh the list
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to unverify vendor");
            }
          }
        }
      ]
    );
  };

  const viewVendorDetails = (vendor: any) => {
    // Navigate to detailed vendor screen
    router.push({
      pathname: '/(admin)/vendor-details',
      params: { id: vendor._id }
    });
  };

  const renderVendorItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.vendorCard}
      onPress={() => viewVendorDetails(item)}
    >
      <View style={styles.vendorInfo}>
        <View style={styles.vendorHeader}>
          <Text style={styles.businessName}>{item.businessName || "Unnamed Business"}</Text>
          {item.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.location}>{item.location || "No location"}</Text>
        <Text style={styles.email}>{item.userId?.email}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.statText}>{item.rating || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={14} color="#64748B" />
            <Text style={styles.statText}>{item.reviewCount || 0}</Text>
          </View>
          {item.priceRange && (
            <Text style={styles.priceRange}>
              NPR {item.priceRange.min}-{item.priceRange.max}
            </Text>
          )}
        </View>
        
        <Text style={styles.joinDate}>
          Joined: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.detailsButton]}
          onPress={() => viewVendorDetails(item)}
        >
          <Ionicons name="information-circle" size={16} color="#4F46E5" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            item.verified ? styles.unverifyButton : styles.verifyButton
          ]}
          onPress={() => item.verified 
            ? unverifyVendor(item._id, item.businessName)
            : verifyVendor(item._id, item.businessName)
          }
        >
          <Ionicons 
            name={item.verified ? "close-circle" : "checkmark-circle"} 
            size={16} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Control Panel</Text>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending ({pendingVendors.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'verified' && styles.activeTab]}
          onPress={() => setActiveTab('verified')}
        >
          <Text style={[styles.tabText, activeTab === 'verified' && styles.activeTabText]}>
            Verified ({verifiedVendors.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vendor List */}
      <View style={styles.section}>
        {activeTab === 'pending' ? (
          pendingVendors.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
              <Text style={styles.emptyText}>All vendors are verified!</Text>
            </View>
          ) : (
            <FlatList
              data={pendingVendors}
              keyExtractor={(item) => item._id}
              renderItem={renderVendorItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
              }
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          verifiedVendors.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color="#64748B" />
              <Text style={styles.emptyText}>No verified vendors yet</Text>
            </View>
          ) : (
            <FlatList
              data={verifiedVendors}
              keyExtractor={(item) => item._id}
              renderItem={renderVendorItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
              }
              showsVerticalScrollIndicator={false}
            />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    padding: 20 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1E293B',
    marginBottom: 8
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 16
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: '#4F46E5'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B'
  },
  activeTabText: {
    color: '#fff'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  vendorCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  vendorInfo: {
    flex: 1
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 2
  },
  location: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2
  },
  email: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 2,
    fontWeight: '600'
  },
  priceRange: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    marginLeft: 'auto'
  },
  joinDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic'
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailsButton: {
    backgroundColor: '#EEF2FF'
  },
  verifyButton: {
    backgroundColor: '#10B981'
  },
  unverifyButton: {
    backgroundColor: '#EF4444'
  },
  emptyState: {
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 12
  }
});