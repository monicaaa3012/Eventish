import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { router } from 'expo-router';
import { apiCall, API_CONFIG } from '../../config/api';

export default function UpdateVendorProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  
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
      // Calls router.get("/me")
      const data = await apiCall(API_CONFIG.ENDPOINTS.VENDORS.ME);
      
      if (data) {
        setVendorData({
          ...data,
          priceRange: {
            min: String(data.priceRange?.min || 0),
            max: String(data.priceRange?.max || 0)
          },
          contactInfo: {
            phone: data.contactInfo?.phone || "",
            email: data.contactInfo?.email || "",
            website: data.contactInfo?.website || ""
          }
        });
        setIsNewProfile(false);
      }
    } catch (error: any) {
      // If profile doesn't exist yet, backend likely returns 404 or a message
      if (error.message.toLowerCase().includes("not found")) {
        console.log("Profile not found - switching to Create Mode");
        setIsNewProfile(true);
      } else {
        Alert.alert("Error", "Could not load profile data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!vendorData.businessName.trim()) {
      Alert.alert("Missing Info", "Business Name is required");
      return;
    }

    setUpdating(true);
    try {
      /**
       * Based on your vendorRoutes.js:
       * POST "/" -> createVendorProfile
       * PUT "/profile" -> updateVendorProfile
       */
      const endpoint = isNewProfile 
        ? API_CONFIG.ENDPOINTS.VENDORS.BROWSE // usually maps to /api/vendors
        : API_CONFIG.ENDPOINTS.VENDORS.PROFILE; // maps to /api/vendors/profile
      
      const method = isNewProfile ? 'POST' : 'PUT';

      await apiCall(endpoint, {
        method: method,
        body: JSON.stringify({
          ...vendorData,
          priceRange: {
            min: Number(vendorData.priceRange.min),
            max: Number(vendorData.priceRange.max)
          }
        }),
      });

      Alert.alert("Success", isNewProfile ? "Profile created!" : "Profile updated!", [
        { text: "OK", onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      Alert.alert("Save Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
        <Text style={styles.headerTitle}>
          {isNewProfile ? "Set Up Your Business" : "Edit Profile"}
        </Text>
        
        <Text style={styles.sectionLabel}>Business Identity</Text>
        <TextInput
          style={styles.input}
          placeholder="Business Name (Visible to customers)"
          value={vendorData.businessName}
          onChangeText={(text) => setVendorData({...vendorData, businessName: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Legal Company Name"
          value={vendorData.companyName}
          onChangeText={(text) => setVendorData({...vendorData, companyName: text})}
        />

        <Text style={styles.sectionLabel}>Contact & Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Location (e.g., Kathmandu, Nepal)"
          value={vendorData.location}
          onChangeText={(text) => setVendorData({...vendorData, location: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Contact Phone"
          keyboardType="phone-pad"
          value={vendorData.contactInfo?.phone}
          onChangeText={(text) => setVendorData({
            ...vendorData, 
            contactInfo: { ...vendorData.contactInfo, phone: text }
          })}
        />

        <Text style={styles.sectionLabel}>Starting Price Range (NPR)</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Min Price"
            keyboardType="numeric"
            value={vendorData.priceRange.min}
            onChangeText={(text) => setVendorData({
              ...vendorData, 
              priceRange: { ...vendorData.priceRange, min: text }
            })}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Max Price"
            keyboardType="numeric"
            value={vendorData.priceRange.max}
            onChangeText={(text) => setVendorData({
              ...vendorData, 
              priceRange: { ...vendorData.priceRange, max: text }
            })}
          />
        </View>

        <Text style={styles.sectionLabel}>About Business</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell customers what you offer..."
          multiline
          numberOfLines={4}
          value={vendorData.description}
          onChangeText={(text) => setVendorData({...vendorData, description: text})}
        />

        <TouchableOpacity 
          style={[styles.submitBtn, isNewProfile && { backgroundColor: '#10B981' }]} 
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isNewProfile ? "Create Profile" : "Save Changes"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#6B7280', marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, fontSize: 16, color: '#111827' },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  submitBtn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 30, marginBottom: 40 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});