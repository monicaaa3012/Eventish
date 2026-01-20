import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthUtils } from '../../utils/auth';
import { getPopularCategories } from '../../config/serviceCategories';

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const role = await AuthUtils.getRole();
        setUserRole(role?.toLowerCase() || null);
        
        // Redirect admins away from explore screen
        if (role?.toLowerCase() === 'admin') {
          router.replace('/(tabs)');
          return;
        }
      } catch (error) {
        console.error("Access check error:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAccess();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Additional protection - don't render for admins
  if (userRole === 'admin') {
    return (
      <View style={styles.centered}>
        <Ionicons name="shield-outline" size={64} color="#EF4444" />
        <Text style={styles.accessDeniedText}>Access Restricted</Text>
        <Text style={styles.accessDeniedSubtext}>This feature is not available for admin users</Text>
      </View>
    );
  }

  // Get popular categories from configuration
  const categories = getPopularCategories();

  // 3. Navigation helper
  const handleSearch = () => {
    router.push({
      pathname: '/(customer)/browse-vendors',
      params: { q: search } // Passes the search text as a query param
    });
  };

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/(customer)/browse-vendors',
      params: { category: category } // Passes the category value to filter the list
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search for services..." 
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch} // Trigger search on "Enter"
          returnKeyType="search"
        />
      </View>

      {/* Categories Section */}
      <Text style={styles.sectionTitle}>Popular Categories</Text>
      <View style={{ maxHeight: 50, marginBottom: 25 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.value} 
              style={styles.catChip}
              onPress={() => handleCategoryPress(cat.value)}
            >
              <Text style={styles.catText}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Browse All Section */}
      <Text style={styles.sectionTitle}>Start Browsing</Text>
      <TouchableOpacity 
        style={styles.browseAllCard}
        onPress={handleSearch}
      >
        <View style={styles.emptyState}>
          <Ionicons name="storefront-outline" size={48} color="#4F46E5" />
          <Text style={styles.emptyText}>View All Available Vendors</Text>
          <Text style={styles.subText}>Find the best services for your event</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  accessDeniedText: { fontSize: 18, fontWeight: 'bold', color: '#EF4444', marginTop: 16, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' },
  searchSection: { 
    flexDirection: 'row', 
    backgroundColor: '#f3f4f6', 
    borderRadius: 12, 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    marginBottom: 24,
    marginTop: 10 
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 15, fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15 },
  catChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10, height: 40 },
  catText: { fontWeight: '600', color: '#4b5563' },
  browseAllCard: { 
    flex: 0.6, 
    backgroundColor: '#F5F3FF', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#C7D2FE',
    borderStyle: 'dashed' 
  },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { textAlign: 'center', color: '#4F46E5', fontWeight: 'bold', marginTop: 10, fontSize: 18 },
  subText: { color: '#9ca3af', fontSize: 14, marginTop: 5 }
});