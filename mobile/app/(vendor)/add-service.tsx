import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiCall, API_CONFIG } from '../../config/api';
import { getAllCategoryValues } from '../../config/serviceCategories';

export default function AddService() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    serviceType: 'photography', // Default to photography
  });

  // Get all available service categories
  const categories = getAllCategoryValues();

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to upload photos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.6,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      // Keep only up to 4 images
      setImages(prev => [...prev, ...selectedUris].slice(0, 4));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.price || images.length === 0) {
      Alert.alert("Missing Fields", "Please fill all details and add at least one image.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('serviceType', formData.serviceType);

    images.forEach((uri, index) => {
      const fileName = uri.split('/').pop() || `service_${index}.jpg`;
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
        // Headers are handled by apiCall for multipart/form-data
      });
      
      Alert.alert("Success", "Service listed successfully!", [
        { text: "OK", onPress: () => router.replace('/(vendor)/my-services') }
      ]);
    } catch (error: any) {
      Alert.alert("Upload Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <TouchableOpacity 
                  style={styles.removeBadge} 
                  onPress={() => setImages(images.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.label}>Service Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Grand Ballroom Wedding Package"
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
              <Text style={[styles.catText, formData.serviceType === cat && styles.catTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Price (NPR)</Text>
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
          placeholder="What is included in this price?"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(txt) => setFormData({...formData, description: txt})}
        />

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>List My Service</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 20, textTransform: 'uppercase' },
  imageRow: { flexDirection: 'row', alignItems: 'center' },
  addPhotoBtn: { 
    width: 90, height: 90, borderRadius: 12, borderWidth: 2, 
    borderColor: '#E5E7EB', borderStyle: 'dashed', 
    justifyContent: 'center', alignItems: 'center', marginRight: 10 
  },
  addPhotoText: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  imageWrapper: { position: 'relative', marginRight: 12 },
  thumbnail: { width: 90, height: 90, borderRadius: 12 },
  removeBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12 },
  input: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  catChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  catText: { color: '#4B5563', fontWeight: '600', fontSize: 13 },
  catTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});