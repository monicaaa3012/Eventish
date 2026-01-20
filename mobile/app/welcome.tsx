import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>
          Eventish<Text style={{ color: '#4F46E5' }}>.</Text>
        </Text>
        <Text style={styles.tagline}>
          Your complete event management platform
        </Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={80} color="#4F46E5" />
        </View>
        
        <Text style={styles.heroTitle}>
          Plan Amazing Events
        </Text>
        <Text style={styles.heroSubtitle}>
          Connect with top vendors, manage bookings, and create unforgettable experiences
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <View style={styles.feature}>
          <Ionicons name="search" size={24} color="#10B981" />
          <Text style={styles.featureText}>Find Perfect Vendors</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
          <Text style={styles.featureText}>Manage Bookings</Text>
        </View>
        
        <View style={styles.feature}>
          <Ionicons name="star" size={24} color="#EF4444" />
          <Text style={styles.featureText}>Read Reviews</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Join thousands of event planners and vendors
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center'
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20
  },
  featuresSection: {
    paddingVertical: 40
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 16
  },
  actionSection: {
    paddingVertical: 20,
    gap: 12
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center'
  }
});