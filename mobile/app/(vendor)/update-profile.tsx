import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api';

export default function UpdateVendorProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [vendorData, setVendorData] = useState<any>({
    businessName: "",
    companyName: "",
    location: "",
    bio: "",
    description: "",
    priceRange: { min: "0", max: "1000" },
    contactInfo: { phone: "", email: "", website: "" },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiCall(API_CONFIG.ENDPOINTS.VENDORS.ME);
      // Ensure strings for TextInput
      setVendorData({
        ...data,
        priceRange: {
          min: String(data.priceRange?.min || 0),
          max: String(data.priceRange?.max || 0)
        }
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await apiCall(API_CONFIG.ENDPOINTS.VENDORS.PROFILE, {
        method: 'PUT',
        body: JSON.stringify({
          ...vendorData,
          priceRange: {
            min: Number(vendorData.priceRange.min),
            max: Number(vendorData.priceRange.max)
          }
        }),
      });
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" color="#4F46E5" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.sectionLabel}>Business Identity</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={vendorData.businessName}
        onChangeText={(text) => setVendorData({...vendorData, businessName: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Company Name"
        value={vendorData.companyName}
        onChangeText={(text) => setVendorData({...vendorData, companyName: text})}
      />

      <Text style={styles.sectionLabel}>Contact & Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={vendorData.location}
        onChangeText={(text) => setVendorData({...vendorData, location: text})}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={vendorData.contactInfo?.phone}
        onChangeText={(text) => setVendorData({
          ...vendorData, 
          contactInfo: { ...vendorData.contactInfo, phone: text }
        })}
      />

      <Text style={styles.sectionLabel}>Price Range (NPR)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="Min"
          keyboardType="numeric"
          value={vendorData.priceRange.min}
          onChangeText={(text) => setVendorData({
            ...vendorData, 
            priceRange: { ...vendorData.priceRange, min: text }
          })}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Max"
          keyboardType="numeric"
          value={vendorData.priceRange.max}
          onChangeText={(text) => setVendorData({
            ...vendorData, 
            priceRange: { ...vendorData.priceRange, max: text }
          })}
        />
      </View>

      <Text style={styles.sectionLabel}>About Your Business</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Business Description"
        multiline
        value={vendorData.description}
        onChangeText={(text) => setVendorData({...vendorData, description: text})}
      />

      <TouchableOpacity 
        style={styles.submitBtn} 
        onPress={handleUpdate}
        disabled={updating}
      >
        {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Update Profile</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginTop: 20, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, marginBottom: 40 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});