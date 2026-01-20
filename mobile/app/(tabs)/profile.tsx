import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Essential for proper layout
import { router, Stack } from 'expo-router';
import { AuthUtils } from '../../utils/auth';
import { apiCall, API_CONFIG } from '../../config/api';
import { Ionicons } from '@expo/vector-icons';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserProfile = async () => {
    try {
      const token = await AuthUtils.getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const cachedUserData = await AuthUtils.getUserData();
      if (cachedUserData) {
        setUserProfile(cachedUserData);
      }

      try {
        const { data } = await apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
        const profileData: UserProfile = {
          name: data.name,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt,
        };
        setUserProfile(profileData);
        await AuthUtils.storeUserData(profileData);
      } catch (apiError) {
        if (!cachedUserData) throw apiError;
      }
    } catch (error: any) {
      if (error.message?.includes('token') || error.message?.includes('auth')) {
        await AuthUtils.clearAuth();
        router.replace('/(auth)/login');
      } else {
        console.error("Profile load error:", error);
        Alert.alert('Error', 'Failed to load profile');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserProfile();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await AuthUtils.clearAuth();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        }
      },
    ]);
  };

  const getRoleColor = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'vendor') return '#10B981'; 
    if (r === 'admin') return '#EF4444';  
    return '#4F46E5'; 
  };

  if (loading && !userProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email}</Text>
          
          <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(userProfile?.role || '')}15` }]}>
            <Text style={[styles.roleText, { color: getRoleColor(userProfile?.role || '') }]}>
              {userProfile?.role?.toUpperCase() || 'CUSTOMER'}
            </Text>
          </View>
        </View>

        {/* Account Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <MenuButton icon="person" label="Edit Profile" onPress={() => {}} />
          
          {userProfile?.role === 'vendor' && (
            <MenuButton 
              icon="business" 
              label="My Business Profile" 
              iconColor="#10B981"
              onPress={() => router.push('/(vendor)/my-profile')} 
            />
          )}
          
          {(userProfile?.role === 'customer' || userProfile?.role === 'user') && (
            <MenuButton 
              icon="heart" 
              label="Saved Vendors" 
              iconColor="#EF4444"
              onPress={() => router.push('/(customer)/wishlist')} 
            />
          )}

          {(userProfile?.role !== 'admin') && (
            <MenuButton 
              icon="calendar" 
              label="My Bookings" 
              onPress={() => router.push('/(tabs)/bookings')} 
            />
          )}

          <MenuButton icon="notifications" label="Notifications" onPress={() => {}} />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <MenuButton icon="help-circle" label="Help & Support" onPress={() => {}} />
          <MenuButton icon="shield-checkmark" label="Privacy Policy" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        
      </ScrollView>
    </SafeAreaView>
  );
}

// Ensure NO HTML tags are used in sub-components
function MenuButton({ icon, label, onPress, iconColor = "#4F46E5" }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}10` }]}>
          <Ionicons name={`${icon}-outline` as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingVertical: 35,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  userEmail: { fontSize: 14, color: '#64748B', marginTop: 4 },
  roleBadge: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  menuSection: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1.2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16, fontWeight: '700', color: '#1E293B' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 35,
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6'
  },
  logoutText: { marginLeft: 10, color: '#EF4444', fontWeight: '800', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 30 }
});