import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HelloWave } from '@/components/hello-wave';
import { AuthUtils } from '../../utils/auth';

// --- Dashboard Components ---

const AdminDashboard = () => (
  <View style={styles.dashboardGrid}>
    <DashboardCard title="Total Sales" value="$12,840" icon="stats-chart" color="#4F46E5" />
    <DashboardCard title="Active Vendors" value="48" icon="storefront" color="#10B981" />
    <DashboardCard title="Pending Approvals" value="12" icon="time" color="#F59E0B" />
    <DashboardCard title="System Reports" value="View" icon="document-text" color="#6B7280" />
  </View>
);

const VendorDashboard = () => (
  <View style={styles.dashboardGrid}>
    <DashboardCard title="My Bookings" value="24" icon="calendar" color="#4F46E5" />
    <DashboardCard title="Revenue" value="$4,200" icon="cash" color="#10B981" />
    <DashboardCard title="New Inquiries" value="7" icon="chatbubbles" color="#8B5CF6" />
    <DashboardCard title="My Services" value="8" icon="list" color="#6B7280" />
  </View>
);

const CustomerDashboard = () => (
  <View style={styles.dashboardGrid}>
    <DashboardCard title="My Events" value="3" icon="ticket" color="#4F46E5" />
    <DashboardCard title="Saved Vendors" value="15" icon="heart" color="#EC4899" />
    <DashboardCard title="Messages" value="2" icon="mail" color="#10B981" />
    <DashboardCard title="Explore" value="Nearby" icon="map" color="#6B7280" />
  </View>
);

const DashboardCard = ({ title, value, icon, color }: any) => (
  <TouchableOpacity style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <ThemedText style={styles.cardValue}>{value}</ThemedText>
    <ThemedText style={styles.cardTitle}>{title}</ThemedText>
  </TouchableOpacity>
);

// --- Main Screen ---

export default function HomeScreen() {
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userData = await AuthUtils.getUserData();
      const role = await AuthUtils.getRole();
      if (userData?.name) setUserName(userData.name);
      if (role) setUserRole(role.toLowerCase());
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title" style={styles.welcomeText}>
                Hello, {userName || 'User'}
              </ThemedText>
              <HelloWave />
            </ThemedView>
            <ThemedText style={styles.subTitle}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Dashboard Content */}
        {userRole === 'admin' && <AdminDashboard />}
        {userRole === 'vendor' && <VendorDashboard />}
        {userRole === 'customer' && <CustomerDashboard />}
        {userRole === 'user' && <CustomerDashboard />}

        {/* Recent Activity Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent Activity</ThemedText>
          <TouchableOpacity><ThemedText style={styles.viewAll}>View All</ThemedText></TouchableOpacity>
        </View>
        <View style={styles.placeholderList}>
           <ThemedText style={styles.placeholderText}>No recent activity to show.</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 12,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#f9fafb',
    width: '47.5%', // Two cards per row with gap
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  cardTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAll: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '700',
  },
  placeholderList: {
    padding: 40,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
  }
});