import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, 
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, 
  Platform, Image 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { apiCall, API_CONFIG, getImageUrl } from '../../config/api';

export default function EditService() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/${id}`);
        setFormData({
          title: data.title,
          price: data.price.toString(),
          description: data.description,
        });
        if (data.images) {
          setSelectedImages(data.images.map((img: string) => ({ 
            uri: getImageUrl(img), 
            isExisting: true,
            originalPath: img // Keep track of backend path
          })));
        }
      } catch (error: any) {
        Alert.alert("Error", "Failed to load service");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({ uri: asset.uri, isExisting: false }));
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.price) {
      Alert.alert("Error", "Title and Price are required");
      return;
    }

    setUpdating(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('price', formData.price);
      data.append('description', formData.description);

      selectedImages.forEach((img) => {
        if (!img.isExisting) {
          const uriParts = img.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          data.append('images', {
            uri: img.uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        } else {
          data.append('existingImages', img.originalPath);
        }
      });

      await apiCall(`${API_CONFIG.ENDPOINTS.SERVICES.BASE}/${id}`, {
        method: 'PUT',
        body: data,
      });

      Alert.alert("Success", "Service updated!", [{ text: "OK", onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator size="large" color="#4F46E5" /></View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Service</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.form}>
          <Text style={styles.label}>Service Photos</Text>
          <View style={styles.imageGrid}>
            <TouchableOpacity style={styles.addBtn} onPress={pickImage}>
              <Ionicons name="add" size={30} color="#4F46E5" />
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
            
            {selectedImages.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img.uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removeBadge} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Service Title</Text>
          <TextInput 
            style={styles.input} 
            value={formData.title} 
            placeholder="What are you offering?"
            onChangeText={(t) => setFormData({...formData, title: t})} 
          />

          <Text style={styles.label}>Price (NPR)</Text>
          <TextInput 
            style={styles.input} 
            value={formData.price} 
            keyboardType="numeric" 
            placeholder="0.00"
            onChangeText={(t) => setFormData({...formData, price: t})} 
          />

          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={formData.description} 
            multiline 
            placeholder="Describe your service..."
            onChangeText={(t) => setFormData({...formData, description: t})} 
          />

          <TouchableOpacity 
            style={[styles.mainSaveBtn, updating && { opacity: 0.7 }]} 
            onPress={handleUpdate} 
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainSaveBtnText}>Update Service</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 20, marginBottom: 8 },
  input: { 
    backgroundColor: '#F9FAFB', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    fontSize: 16
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  addBtn: { 
    width: 90, 
    height: 90, 
    backgroundColor: '#EEF2FF', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#4F46E5', 
    borderStyle: 'dashed' 
  },
  addText: { fontSize: 12, color: '#4F46E5', fontWeight: '600', marginTop: 4 },
  previewImage: { width: 90, height: 90, borderRadius: 12 },
  imageWrapper: { position: 'relative' },
  removeBadge: { 
    position: 'absolute', 
    top: -8, 
    right: -8, 
    backgroundColor: '#fff', 
    borderRadius: 12 
  },
  mainSaveBtn: { 
    backgroundColor: '#4F46E5', 
    padding: 18, 
    borderRadius: 15, 
    marginTop: 40, 
    alignItems: 'center',
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  mainSaveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});