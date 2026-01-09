import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api'; 
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function VendorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [vendorServices, setVendorServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

 const fetchData = async () => {
  try {
    setLoading(true);
    
    // 1. Use .BROWSE instead of .ALL
    // This results in: http://192.168.18.7:5000/api/vendors/68505...
    const vendorData = await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}/${id}`);
    setVendor(vendorData);

    // 2. Use .BASE instead of .ALL for services
    // This results in: http://192.168.18.7:5000/api/services
    const allServices = await apiCall(API_CONFIG.ENDPOINTS.SERVICES.BASE);
    
    const specificServices = allServices.filter(
      (service: any) => service.createdBy && service.createdBy._id === vendorData.userId?._id
    );
    
    setVendorServices(specificServices);
  } catch (error) {
    console.error("Error fetching vendor details or services:", error);
  } finally {
    setLoading(false);
  }
};

  const getImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/400';
    // Using your backend IP
    return `http://192.168.18.7:5000/${path}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.center}>
        <Text>Vendor not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{color: '#fff'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const coverImage = vendorServices.length > 0 && vendorServices[0].images?.length > 0
    ? getImageUrl(vendorServices[0].images[0])
    : 'https://via.placeholder.com/800x600?text=No+Image+Available';

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: coverImage }} style={styles.headerImage} />
        <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.businessName}>{vendor.businessName}</Text>
          {vendor.featured && (
             <View style={styles.featuredBadge}>
               <Text style={styles.featuredText}>Featured</Text>
             </View>
          )}
        </View>
        
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color="#64748B" />
          <Text style={styles.locationText}>{vendor.location}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#EAB308" />
            <Text style={styles.ratingText}>{vendor.rating || 0}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {vendor.description || "Professional service provider committed to making your event exceptional."}
        </Text>

        <Text style={styles.sectionTitle}>Services Offered</Text>
        
        {vendorServices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No services listed yet.</Text>
          </View>
        ) : (
          vendorServices.map((service) => (
            <View key={service._id} style={styles.serviceItem}>
              {service.images && service.images.length > 0 && (
                <Image 
                  source={{ uri: getImageUrl(service.images[0]) }} 
                  style={styles.serviceImage} 
                />
              )}
              <View style={styles.serviceDetails}>
                <Text style={styles.serviceType}>
                  {service.serviceType ? service.serviceType.toUpperCase() : "SERVICE"}
                </Text>
                <Text style={styles.servicePrice}>NPR {service.price}</Text>
                <Text style={styles.serviceInfo} numberOfLines={2}>
                  {service.description}
                </Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: '100%', height: 300, position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  backArrow: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  card: { marginTop: -30, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, minHeight: 500 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  businessName: { fontSize: 24, fontWeight: '900', color: '#1E293B', flex: 1 },
  featuredBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  featuredText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { marginLeft: 4, color: '#64748B', fontSize: 14, marginRight: 15 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9C3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  ratingText: { marginLeft: 4, fontWeight: 'bold', color: '#854D0E' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  description: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 20 },
  serviceItem: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  serviceImage: { width: 80, height: 80, borderRadius: 12 },
  serviceDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  serviceType: { fontSize: 11, fontWeight: '700', color: '#4F46E5' },
  servicePrice: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  serviceInfo: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94A3B8', marginTop: 10 },
  backBtn: { marginTop: 20, backgroundColor: '#4F46E5', padding: 12, borderRadius: 8 }
});