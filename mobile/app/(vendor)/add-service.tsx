import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, API_CONFIG } from '../../config/api';

export default function AddService() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    serviceType: 'venue', // Match backend lowercase enum
  });

  // Categories MUST match the lowercase enum in your servicemodel.js
  const categories = ['venue', 'catering', 'photography', 'music', 'decoration', 'makeup'];

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to upload photos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages(selectedUris);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || images.length === 0) {
      Alert.alert("Missing Fields", "Please fill all fields and add at least one image.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('serviceType', formData.serviceType);

    images.forEach((uri) => {
      const fileName = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      data.append('images', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: fileName,
        type: type,
      } as any);
    });

    try {
      await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/add`, {
        method: 'POST',
        body: data,
      });
      Alert.alert("Success", "Service listed successfully!");
      router.back();
    } catch (error: any) {
      // If it still errors, it's likely the Backend Enum or Title field mismatch
      Alert.alert("Upload Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} 
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Added Header back for navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Service</Text>
        </View>

        {/* Image Picker Section */}
        <Text style={styles.label}>Service Images (Max 4)</Text>
        <View style={styles.imageRow}>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
            <Ionicons name="camera" size={32} color="#4F46E5" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.thumbnail} />
                <TouchableOpacity style={styles.removeBadge} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Inputs */}
        <Text style={styles.label}>Service Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Luxury Wedding Hall"
          value={formData.title}
          onChangeText={(txt) => setFormData({...formData, title: txt})}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catChip, formData.serviceType === cat && styles.catChipActive]}
              onPress={() => setFormData({...formData, serviceType: cat})}
            >
              <Text style={[
                styles.catText, 
                formData.serviceType === cat && styles.catTextActive,
                { textTransform: 'capitalize' } // Visual fix: 'venue' -> 'Venue'
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Price per Event (NPR)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="50000"
          keyboardType="numeric"
          value={formData.price}
          onChangeText={(txt) => setFormData({...formData, price: txt})}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Describe what is included..."
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(txt) => setFormData({...formData, description: txt})}
          blurOnSubmit={true} 
        />

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Add Service</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 25 },
  backBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 12, marginRight: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  label: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 10, marginTop: 20 },
  imageRow: { flexDirection: 'row', alignItems: 'center' },
  addPhotoBtn: { 
    width: 100, height: 100, borderRadius: 15, borderWidth: 2, 
    borderColor: '#E5E7EB', borderStyle: 'dashed', 
    justifyContent: 'center', alignItems: 'center', marginRight: 10 
  },
  addPhotoText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  imageWrapper: { position: 'relative', marginRight: 12 },
  thumbnail: { width: 100, height: 100, borderRadius: 15 },
  removeBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12 },
  input: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  textArea: { height: 120, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  catChipActive: { backgroundColor: '#4F46E5' },
  catText: { color: '#4B5563', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});