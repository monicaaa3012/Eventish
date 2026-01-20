// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Welcome screen for new users */}
      <Stack.Screen name="welcome" />
      
      {/* (tabs) handles the main dashboard */}
      <Stack.Screen name="(tabs)" />
      
      {/* (customer) handles the planning flow */}
      <Stack.Screen 
        name="(customer)" 
        options={{ 
          presentation: 'card', // Standard slide animation
          headerShown: false    // Let the inner layout handle the header
        }} 
      />
      
      {/* (vendor) handles vendor-specific screens */}
      <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
      
      {/* (admin) handles admin-specific screens */}
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      
      {/* (auth) handles login/register */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
} 