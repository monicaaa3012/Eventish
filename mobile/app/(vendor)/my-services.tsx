import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api';

export default function MyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyServices = async () => {
    try {
      const data = await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/my-services`);
      setServices(data);
    } catch (error: any) {
      Alert.alert("Error", "Could not load your services");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyServices();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Service", "Remove this listing permanently?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/${id}`, { method: 'DELETE' });
            setServices(services.filter((s: any) => s._id !== id));
          } catch (error) {
            Alert.alert("Error", "Failed to delete service");
          }
        } 
      }
    ]);
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent} 
        onPress={() => router.push({ pathname: '/service-details', params: { id: item._id } })}
      >
        <Image source={{ uri: getImageUrl(item.images?.[0]) }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.badge}><Text style={styles.type}>{item.serviceType}</Text></View>
          <Text style={styles.price}>NPR {item.price.toLocaleString()}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: '/edit-service', params: { id: item._id } })}>
          <Ionicons name="pencil" size={16} color="#4F46E5" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMyServices(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={64} color="#D1D5DB" />
            <Text style={styles.empty}>No services listed yet.</Text>
            <TouchableOpacity style={styles.addInlineBtn} onPress={() => router.push('/add-service')}>
              <Text style={styles.addInlineText}>Add Your First Service</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', marginBottom: 15, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardContent: { flexDirection: 'row', flex: 1 },
  image: { width: 85, height: 85, borderRadius: 12, backgroundColor: '#f3f4f6' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  badge: { backgroundColor: '#EEF2FF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  type: { fontSize: 10, color: '#4F46E5', fontWeight: 'bold', textTransform: 'uppercase' },
  price: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 8 },
  actions: { justifyContent: 'space-around', alignItems: 'center', paddingLeft: 10 },
  editBtn: { padding: 8, backgroundColor: '#EEF2FF', borderRadius: 8 },
  deleteBtn: { padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { color: '#6B7280', fontSize: 16, marginTop: 10 },
  addInlineBtn: { marginTop: 20, backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  addInlineText: { color: '#fff', fontWeight: '600' }
});