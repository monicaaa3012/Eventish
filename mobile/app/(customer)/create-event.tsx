import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api';

export default function CreateEvent() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    location: '',
    budget: '',
    eventType: 'Wedding', // Default matching your enum
  });

  const eventTypes = ['Wedding', 'Birthday', 'Corporate', 'Conference', 'Party', 'Other'];

  const handleCreate = async () => {
    // Basic Validation
    if (!formData.title || !formData.budget || !formData.location) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.EVENTS.BASE, {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget), // Convert string to number for backend
        }),
      });

      Alert.alert("Success", "Your event has been created!", [
        { text: "OK", onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      Alert.alert("Creation Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Plan New Event</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Event Title *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Sarah's Wedding" 
          value={formData.title}
          onChangeText={(val) => setFormData({...formData, title: val})}
        />

        <Text style={styles.label}>Event Type</Text>
        <View style={styles.typeContainer}>
          {eventTypes.map((type) => (
            <TouchableOpacity 
              key={type}
              style={[styles.typeChip, formData.eventType === type && styles.activeChip]}
              onPress={() => setFormData({...formData, eventType: type})}
            >
              <Text style={[styles.typeText, formData.eventType === type && styles.activeTypeText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="2024-12-25" 
          value={formData.date}
          onChangeText={(val) => setFormData({...formData, date: val})}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Venue name or address" 
          value={formData.location}
          onChangeText={(val) => setFormData({...formData, location: val})}
        />

        <Text style={styles.label}>Budget ($) *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="5000" 
          keyboardType="numeric"
          value={formData.budget}
          onChangeText={(val) => setFormData({...formData, budget: val})}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, { height: 100 }]} 
          placeholder="Tell us more about the event..." 
          multiline
          value={formData.description}
          onChangeText={(val) => setFormData({...formData, description: val})}
        />

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Create Event</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: '800', marginBottom: 20, marginTop: 10 },
  form: { gap: 15 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: -10 },
  input: { backgroundColor: '#F9FAF7', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 15, fontSize: 16 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  activeChip: { backgroundColor: '#4F46E5' },
  typeText: { color: '#6B7280', fontWeight: '600' },
  activeTypeText: { color: '#fff' },
  submitBtn: { backgroundColor: '#111827', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 20, marginBottom: 50 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});