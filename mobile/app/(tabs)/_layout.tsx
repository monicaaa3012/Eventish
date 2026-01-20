import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { AuthUtils } from '../../utils/auth';

export default function TabLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const userRole = await AuthUtils.getRole();
        // Normalize role to lowercase to prevent "User" vs "user" bugs
        const normalizedRole = userRole ? userRole.toLowerCase().trim() : null;
        setRole(normalizedRole);
      } catch (error) {
        console.error("Error fetching role:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRole();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Checking permissions...</Text>
      </View>
    );
  }

  return (
    <Tabs
      key={role} 
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { height: 60, paddingBottom: 8 },
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        headerShadowVisible: false,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          // Show explore tab only for customers (role 'user' or 'customer')
          href: (role === 'user' || role === 'customer') ? '/explore' : null,
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          // Show bookings tab for customers and vendors, but not admins
          href: (role === 'user' || role === 'customer' || role === 'vendor') ? '/bookings' : null,
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}