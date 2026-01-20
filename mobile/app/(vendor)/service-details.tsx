import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api';

const { width } = Dimensions.get('window');

export default function ServiceDetails() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/${id}`);
        setService(data);
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

  if (!service) return (
    <View style={styles.centered}><Text>Service not found</Text></View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Image Gallery */}
      <View>
        <FlatList
          data={service.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveImageIndex(index);
          }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image 
              source={{ uri: getImageUrl(item) }} 
              style={styles.image} 
              resizeMode="cover"
            />
          )}
        />
        
        {/* Image Pagination Dots */}
        {service.images?.length > 1 && (
          <View style={styles.pagination}>
            {service.images.map((_: any, i: number) => (
              <View 
                key={i} 
                style={[styles.dot, activeImageIndex === i ? styles.activeDot : null]} 
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.contentCard}>
        <View style={styles.row}>
          <Text style={styles.title}>{service.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.serviceType?.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.price}>NPR {service.price}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{service.description}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.statText}>
              Listed on: {new Date(service.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push({ pathname: '/edit-service', params: { id: service._id } })}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: width, height: 350, backgroundColor: '#e1e4e8' },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 20,
  },
  backButton: { 
    position: 'absolute', top: 50, left: 20, zIndex: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 
  },
  contentCard: { 
    backgroundColor: '#fff', marginTop: -30, borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, padding: 25, minHeight: 400,
    elevation: 5
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', flex: 1 },
  badge: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#4F46E5', fontSize: 12, fontWeight: 'bold' },
  price: { fontSize: 22, fontWeight: '700', color: '#4F46E5', marginTop: 10 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  description: { fontSize: 16, color: '#4B5563', lineHeight: 24 },
  statsContainer: { marginTop: 25 },
  stat: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statText: { marginLeft: 10, color: '#6B7280', fontSize: 14 },
  footer: { marginTop: 40, marginBottom: 40 },
  editButton: { 
    backgroundColor: '#4F46E5', flexDirection: 'row', justifyContent: 'center', 
    alignItems: 'center', padding: 16, borderRadius: 12 
  },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});