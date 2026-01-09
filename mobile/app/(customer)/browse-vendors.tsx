import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, 
  TouchableOpacity, Image, ActivityIndicator, ScrollView, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api';

const SERVICE_CATEGORIES = [
  { value: "Photography", label: "Photography", icon: "camera" },
  { value: "Catering", label: "Catering", icon: "restaurant" },
  { value: "Music", label: "Music", icon: "musical-notes" },
  { value: "Venues", label: "Venues", icon: "business" },
  { value: "Decor", label: "Decor", icon: "flower" }
];

export default function VendorBrowse() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize filters with params coming from ExploreScreen
  const [filters, setFilters] = useState({
    service: (params.category as string) || "",
    search: (params.q as string) || "",
  });

  // Keep the internal search text local for the input field
  const [searchInput, setSearchInput] = useState((params.q as string) || "");

  // Update filters if the user navigates here again with different params
  useEffect(() => {
    setFilters({
      service: (params.category as string) || "",
      search: (params.q as string) || ""
    });
    setSearchInput((params.q as string) || "");
  }, [params.category, params.q]);

  useEffect(() => {
    fetchVendorsAndServices();
  }, [filters]);

  const fetchVendorsAndServices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.service) queryParams.append('category', filters.service);
      if (filters.search) queryParams.append('search', filters.search);

      const vendorData = await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}?${queryParams.toString()}`);
      const vendorList = Array.isArray(vendorData) ? vendorData : vendorData.vendors || [];

      const servicesData = await apiCall(API_CONFIG.ENDPOINTS.SERVICES.BASE);
      const allServices = Array.isArray(servicesData) ? servicesData : servicesData.services || [];

      const mergedVendors = vendorList.map((vendor: any) => {
        const vendorServices = allServices.filter(
          (s: any) => s.createdBy && (s.createdBy === vendor.userId?._id || s.createdBy._id === vendor.userId?._id)
        );

        let displayImage = null;
        if (vendor.portfolio && vendor.portfolio.length > 0) {
          displayImage = vendor.portfolio[0];
        } else if (vendorServices.length > 0 && vendorServices[0].images?.length > 0) {
          displayImage = vendorServices[0].images[0];
        }

        return { ...vendor, displayImage };
      });

      setVendors(mergedVendors);
    } catch (error) {
      console.error("Browse Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSearch = () => {
    setFilters({ ...filters, search: searchInput });
  };

  const renderVendorCard = ({ item }: { item: any }) => {
    const imageUrl = item.displayImage ? getImageUrl(item.displayImage) : null;

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push({
          pathname: "/vendor-details", 
          params: { id: item._id }
        })}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Ionicons name="images-outline" size={40} color="#CBD5E1" />
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.businessName}>{item.businessName || "Unnamed Vendor"}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
            <Text style={styles.locationText}> • {item.location}</Text>
          </View>
          <Text style={styles.priceText}>
            NPR {item.priceRange?.min?.toLocaleString()} - {item.priceRange?.max?.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search vendor name..."
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleLocalSearch}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={() => {setSearchInput(""); setFilters({...filters, search: ""})}}>
                <Ionicons name="close-circle" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Category Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity 
            style={[styles.catItem, filters.service === "" && styles.catItemActive]}
            onPress={() => setFilters({...filters, service: ""})}
          >
            <Text style={[styles.catText, filters.service === "" && styles.catTextActive]}>All</Text>
          </TouchableOpacity>
          {SERVICE_CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.value} 
              style={[styles.catItem, filters.service === cat.value && styles.catItemActive]}
              onPress={() => setFilters({...filters, service: cat.value})}
            >
              <Ionicons name={cat.icon as any} size={16} color={filters.service === cat.value ? "#fff" : "#4F46E5"} />
              <Text style={[styles.catText, filters.service === cat.value && styles.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item._id}
          renderItem={renderVendorCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={50} color="#94A3B8" />
              <Text style={styles.empty}>No vendors found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchBarContainer: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F1F5F9', 
    borderRadius: 12, 
    paddingHorizontal: 12,
    height: 45
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  categoryScroll: { paddingLeft: 20, paddingVertical: 12 },
  catItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  catItemActive: { backgroundColor: '#4F46E5' },
  catText: { marginLeft: 6, color: '#64748B', fontWeight: '600' },
  catTextActive: { color: '#fff' },
  listContainer: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12 },
  imageContainer: { height: 180, width: '100%' },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  cardContent: { padding: 15 },
  businessName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  ratingText: { fontSize: 13, color: '#1E293B', fontWeight: '700', marginLeft: 4 },
  locationText: { fontSize: 13, color: '#64748B' },
  priceText: { fontSize: 16, fontWeight: '800', color: '#4F46E5', marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  empty: { textAlign: 'center', marginTop: 15, color: '#94A3B8', fontSize: 16 }
});