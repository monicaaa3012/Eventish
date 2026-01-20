import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api'; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VendorDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [vendorServices, setVendorServices] = useState<any[]>([]);
  const [reviewsData, setReviewsData] = useState<any>({ reviews: [], rating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // Wishlist state
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const role = await AsyncStorage.getItem('role');
      setCurrentUserRole(role);

      // 1. Fetch Vendor Profile
      const vendorData = await apiCall(`${API_CONFIG.ENDPOINTS.VENDORS.BROWSE}/${id}`);
      setVendor(vendorData);

      // 2. Fetch Reviews
      try {
        const reviews = await apiCall(`/vendors/${id}/reviews`);
        setReviewsData(reviews);
      } catch (e) { console.log("Reviews fail", e); }

      // 3. Fetch specific services for this vendor
      const allServices = await apiCall(API_CONFIG.ENDPOINTS.SERVICES.BASE);
      const specificServices = allServices.filter(
        (s: any) => s.createdBy?._id === vendorData.userId?._id || s.createdBy === vendorData.userId?._id
      );
      setVendorServices(specificServices);

      // 4. Check Wishlist Status (Optional: API could return this, or we fetch user profile)
      // For this implementation, we assume the API handles the toggle
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      // Calls the wishlist endpoint we set up earlier
      const res = await apiCall(`/recommendations/wishlist/${id}`, { method: 'POST' });
      if (res.success) {
        setIsSaved(res.isSaved);
        Alert.alert(
          res.isSaved ? "Saved to Wishlist" : "Removed", 
          res.isSaved ? "You can find this vendor in your saved list." : "Vendor removed from favorites."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Could not update wishlist. Please try again.");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  const coverImage = vendor?.profileImage 
    ? getImageUrl(vendor.profileImage)
    : vendor?.portfolio && vendor.portfolio.length > 0
    ? getImageUrl(vendor.portfolio[0])
    : vendorServices.length > 0 && vendorServices[0].images?.length > 0
    ? getImageUrl(vendorServices[0].images[0])
    : 'https://via.placeholder.com/800x600?text=No+Image';

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER BUTTONS */}
      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {currentUserRole !== 'vendor' && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleToggleSave}>
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={24} 
              color={isSaved ? "#EF4444" : "#fff"} 
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.container} 
        bounces={true}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: coverImage }} style={styles.headerImage} />

        <View style={styles.card}>
          <View style={styles.indicator} />
          
          <Text style={styles.businessName}>{vendor.businessName}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color="#4F46E5" />
              <Text style={styles.locationText}>{vendor.location}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#EAB308" />
              <Text style={styles.ratingText}>{reviewsData.rating?.toFixed(1) || "0.0"}</Text>
              <Text style={styles.reviewCount}>({reviewsData.reviewCount})</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{vendor.description || "No description provided."}</Text>

          <Text style={styles.sectionTitle}>Services Offered</Text>
          {vendorServices.length > 0 ? (
            vendorServices.map((service) => (
              <View key={service._id} style={styles.serviceItem}>
                {service.images?.length > 0 && (
                  <Image source={{ uri: getImageUrl(service.images[0]) }} style={styles.serviceImage} />
                )}
                <View style={styles.serviceInfoCol}>
                  <Text style={styles.serviceType}>{service.serviceType}</Text>
                  <Text style={styles.servicePrice}>NPR {service.price}</Text>
                </View>
              </View>
            ))
          ) : (
             <Text style={styles.emptyText}>No service details available.</Text>
          )}

          {/* REVIEWS SECTION */}
          <View style={styles.reviewSectionHeader}>
            <Text style={styles.sectionTitle}>Customer Feedback</Text>
            <Text style={styles.seeAllReviews}>Recent</Text>
          </View>

          {reviewsData.reviews?.length === 0 ? (
            <View style={styles.emptyReviewBox}>
              <Text style={styles.emptyReviewText}>Be the first to review this vendor!</Text>
            </View>
          ) : (
            reviewsData.reviews.map((rev: any) => (
              <View key={rev._id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewUserCircle}>
                    <Text style={styles.userInitial}>{rev.user?.name?.charAt(0) || 'U'}</Text>
                  </View>
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewerName}>{rev.user?.name || "Customer"}</Text>
                    <View style={styles.starRow}>
                       {[...Array(5)].map((_, i) => (
                         <Ionicons key={i} name="star" size={10} color={i < rev.rating ? "#EAB308" : "#E2E8F0"} />
                       ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{new Date(rev.date).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          )}

          <View style={{ height: 160 }} />
        </View>
      </ScrollView>

      {/* Book Now Bar */}
      {currentUserRole !== 'vendor' && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.priceLabel}>Starting from</Text>
            <Text style={styles.priceValue}>NPR {vendor.priceRange?.min || '0'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.bookBtn} 
            onPress={() => router.push({ 
                pathname: "/create-booking", 
                params: { vendorId: vendor._id, businessName: vendor.businessName } 
            })}
          >
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImage: { width: '100%', height: 350 },
  
  // Updated Header Buttons Style
  headerButtons: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    right: 20, 
    zIndex: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  iconBtn: { 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    padding: 10, 
    borderRadius: 25,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },

  card: { marginTop: -40, backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 25, paddingTop: 15 },
  indicator: { width: 40, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  businessName: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  locationText: { marginLeft: 5, color: '#64748B', fontSize: 14 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9C3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingText: { marginLeft: 4, fontWeight: 'bold', color: '#854D0E', fontSize: 14 },
  reviewCount: { fontSize: 12, color: '#854D0E', opacity: 0.6, marginLeft: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
  description: { fontSize: 15, color: '#64748B', lineHeight: 24, marginBottom: 25 },
  serviceItem: { flexDirection: 'row', marginBottom: 15, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 12 },
  serviceImage: { width: 70, height: 70, borderRadius: 15 },
  serviceInfoCol: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  serviceType: { fontSize: 12, color: '#4F46E5', fontWeight: 'bold', textTransform: 'uppercase' },
  servicePrice: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 2 },
  emptyText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic', marginBottom: 20 },
  
  reviewSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  seeAllReviews: { color: '#64748B', fontSize: 12 },
  reviewCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  reviewTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewUserCircle: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  userInitial: { color: '#4F46E5', fontWeight: 'bold' },
  reviewUserInfo: { flex: 1, marginLeft: 12 },
  reviewerName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  starRow: { flexDirection: 'row', marginTop: 2 },
  reviewDate: { fontSize: 11, color: '#94A3B8' },
  reviewComment: { fontSize: 14, color: '#475569', lineHeight: 20 },
  emptyReviewBox: { padding: 30, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 20 },
  emptyReviewText: { color: '#94A3B8', fontSize: 13 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', padding: 25, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#F1F5F9', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 12, color: '#64748B' },
  priceValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  bookBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 35, paddingVertical: 16, borderRadius: 16 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});