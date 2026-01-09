import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api';
import { router } from 'expo-router';

export default function MyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  const fetchMyServices = async () => {
    try {
      const data = await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/my-services`);
      setServices(data);
    } catch (error: any) {
      Alert.alert("Error", "Could not load your services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  // Delete handler
  const handleDelete = (id: string) => {
    Alert.alert("Delete Service", "Are you sure you want to remove this listing?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/${id}`, { method: 'DELETE' });
            setServices(services.filter((s: any) => s._id !== id));
          } catch (error: any) {
            Alert.alert("Error", "Failed to delete service");
          }
        } 
      }
    ]);
  };

  // Render individual service card
  const renderServiceItem = ({ item }: { item: any }) => {
    // Uses the helper from your updated api.ts
    const imageUrl = getImageUrl(item.images?.[0]);

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardContent} 
          onPress={() => router.push({ 
            pathname: '/service-details', 
            params: { id: item._id } 
          })}
        >
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image} 
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.type}>{item.serviceType?.toUpperCase()}</Text>
            <Text style={styles.price}>NPR {item.price}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => router.push({ 
              pathname: '/edit-service', 
              params: { id: item._id } 
            })}
          >
            <Ionicons name="pencil-outline" size={18} color="#4F46E5" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Services</Text>
      </View>

      {/* List Section */}
      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        renderItem={renderServiceItem}
        ListEmptyComponent={<Text style={styles.empty}>No services listed yet.</Text>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginLeft: 15,
    color: '#111827'
  },
  listContent: { 
    padding: 20 
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    flexDirection: 'row', 
    marginBottom: 15, 
    padding: 12, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardContent: { 
    flexDirection: 'row', 
    flex: 1 
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    backgroundColor: '#f3f4f6' 
  },
  info: { 
    flex: 1, 
    marginLeft: 15, 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#111827' 
  },
  type: { 
    fontSize: 11, 
    color: '#6B7280', 
    marginTop: 2,
    fontWeight: '600'
  },
  price: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#4F46E5', 
    marginTop: 6 
  },
  actions: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 45,
    gap: 10
  },
  editBtn: { 
    padding: 8, 
    backgroundColor: '#EEF2FF', 
    borderRadius: 10 
  },
  deleteBtn: { 
    padding: 8, 
    backgroundColor: '#FEE2E2', 
    borderRadius: 10 
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#6B7280',
    fontSize: 15
  }
});