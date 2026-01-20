import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiCall } from '../../config/api'; 
import { Ionicons } from '@expo/vector-icons';

const RecommendationCard = ({ item, onSave }: { item: any, onSave: (id: string) => Promise<boolean> }) => {
  const router = useRouter();
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const matchPercentage = Math.round(item.similarity * 100);

  const handlePressSave = async () => {
    const success = await onSave(item._id);
    if (success) setIsSaved(!isSaved);
  };

  return (
    <View style={styles.vendorCard}>
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/vendor-details', params: { id: item._id } })}
        activeOpacity={0.7}
      >
        <View style={styles.vendorHeader}>
          <View style={[styles.matchBadge, { backgroundColor: matchPercentage > 70 ? '#DCFCE7' : '#F1F5F9' }]}>
            <Text style={[styles.matchText, { color: matchPercentage > 70 ? '#15803D' : '#475569' }]}>
              {matchPercentage}% Match
            </Text>
          </View>
          <TouchableOpacity onPress={handlePressSave}>
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={isSaved ? "#4F46E5" : "#64748B"} 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.vendorName}>{item.businessName}</Text>
        <Text style={styles.vendorLoc}>{item.location}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.whyMatchBtn} onPress={() => setShowExplanation(!showExplanation)}>
        <Ionicons name={showExplanation ? "chevron-up" : "bulb-outline"} size={14} color="#4F46E5" />
        <Text style={styles.whyMatchText}>{showExplanation ? "Hide Analysis" : "Why this match?"}</Text>
      </TouchableOpacity>

      {showExplanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>AI Analysis Highlights:</Text>
          <View style={styles.tagRow}>
            {item.matchingFeatures?.map((feature: string, index: number) => (
              <View key={index} style={styles.matchTag}>
                <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                <Text style={styles.matchTagText}>{feature.split(':')[1] || feature}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default function RecommendationsScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams(); // Catch ID from View All button
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'selection' | 'results'>('selection');

  useEffect(() => {
    initScreen();
  }, [eventId]);

  const initScreen = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/events/my-events');
      setUserEvents(data);

      if (eventId) {
        // If coming from specific event, skip selection
        const response = await apiCall('/recommendations/jaccard', {
          method: 'POST',
          body: JSON.stringify({ eventIds: [eventId] })
        });
        setRecommendations(response.recommendations || []);
        setStep('results');
      } else {
        setSelectedEventIds(data.map((e: any) => e._id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (selectedEventIds.length === 0) return;
    try {
      setLoading(true);
      const response = await apiCall('/recommendations/jaccard', {
        method: 'POST',
        body: JSON.stringify({ eventIds: selectedEventIds })
      });
      setRecommendations(response.recommendations || []);
      setStep('results');
    } catch (error) {
      Alert.alert("Error", "Could not generate matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVendor = async (vendorId: string): Promise<boolean> => {
    try {
      const response = await apiCall(`/recommendations/wishlist/${vendorId}`, { method: 'POST' });
      return response.success;
    } catch (error) {
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (step === 'results' && !eventId) ? setStep('selection') : router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 'selection' ? 'Match Preferences' : 'AI Recommendations'}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>
      ) : step === 'selection' ? (
        <View style={styles.content}>
          <Text style={styles.label}>Analyze these events:</Text>
          <FlatList
            data={userEvents}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.eventCard, selectedEventIds.includes(item._id) && styles.selectedEventCard]}
                onPress={() => setSelectedEventIds(prev => prev.includes(item._id) ? prev.filter(id => id !== item._id) : [...prev, item._id])}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventSub}>{item.eventType}</Text>
                </View>
                <Ionicons name={selectedEventIds.includes(item._id) ? "checkbox" : "square-outline"} size={24} color="#4F46E5" />
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleGenerateRecommendations}>
            <Text style={styles.primaryBtnText}>Find Matches</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => <RecommendationCard item={item} onSave={handleSaveVendor} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  label: { fontSize: 14, color: '#64748B', marginBottom: 15, fontWeight: '600' },
  eventCard: { flexDirection: 'row', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  selectedEventCard: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  eventTitle: { fontSize: 16, fontWeight: 'bold' },
  eventSub: { fontSize: 12, color: '#64748B' },
  primaryBtn: { backgroundColor: '#4F46E5', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold' },
  vendorCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  vendorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  matchBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  matchText: { fontSize: 12, fontWeight: 'bold' },
  vendorName: { fontSize: 18, fontWeight: 'bold' },
  vendorLoc: { fontSize: 14, color: '#64748B' },
  whyMatchBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  whyMatchText: { fontSize: 12, color: '#4F46E5', fontWeight: '600', marginLeft: 5 },
  explanationBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginTop: 10 },
  explanationTitle: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  matchTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginBottom: 6 },
  matchTagText: { fontSize: 10, color: '#15803D', fontWeight: '600', marginLeft: 4, textTransform: 'capitalize' },
});