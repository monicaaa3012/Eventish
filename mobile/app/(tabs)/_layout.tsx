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
        
        // DEBUG LOG: Look at your VS Code Terminal / Metro Terminal for this!
        console.log("DEBUG: The role fetched from storage is:", userRole);
        
        // We normalize it to lowercase and remove any hidden spaces
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10 }}>Checking permissions...</Text>
      </View>
    );
  }

  return (
    <Tabs
      key={role} 
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        headerTitleStyle: { fontWeight: '800' },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} />,
        }}
      />

      {/* Explore Tab */}
     <Tabs.Screen
  name="explore"
  options={{
    title: 'Find Vendors',
    // Change this check to match your backend "user" role
    href: role === 'user' ? '/explore' : null, 
    tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
  }}
/>
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
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