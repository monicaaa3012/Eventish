import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image,ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  const [search, setSearch] = useState('');

  // Example Data
  const categories = ['Photography', 'Catering', 'Music', 'Venues', 'Decor'];

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search for services..." 
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} style={styles.catChip}>
            <Text style={styles.catText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Popular Vendors</Text>
      <View style={styles.emptyState}>
        <Ionicons name="storefront-outline" size={48} color="#E5E7EB" />
        <Text style={styles.emptyText}>Start searching to find the best vendors for your event.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  searchSection: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 12, alignItems: 'center', paddingHorizontal: 15, marginBottom: 24 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 15, fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15 },
  catScroll: { maxHeight: 50, marginBottom: 25 },
  catChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  catText: { fontWeight: '600', color: '#4b5563' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 10, fontSize: 16 }
});