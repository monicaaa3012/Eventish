// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
      
      {/* (auth) handles login/register */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
} 