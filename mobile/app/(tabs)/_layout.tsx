import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { AuthUtils } from '../../utils/auth';

export default function TabLayout() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    AuthUtils.getRole().then(setRole);
  }, []);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4F46E5', headerStyle: { elevation: 0, shadowOpacity: 0 }, headerTitleStyle: { fontWeight: '800' } }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({color}) => <Ionicons name="grid" size={24} color={color}/> }} />
      
      {/* Search is for Customers only */}
      <Tabs.Screen 
        name="explore" 
        options={{ 
          title: 'Find Vendors', 
          href: role === 'customer' ? '/explore' : null, 
          tabBarIcon: ({color}) => <Ionicons name="search" size={24} color={color}/> 
        }} 
      />

      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({color}) => <Ionicons name="calendar" size={24} color={color}/> }} />
      <Tabs.Screen name="profile" options={{ title: 'Account', tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color}/> }} />
    </Tabs>
  );
}