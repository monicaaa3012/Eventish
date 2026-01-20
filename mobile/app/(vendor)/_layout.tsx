import { Stack } from 'expo-router';

export default function VendorLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: true, 
      headerTitleStyle: { fontWeight: '800', fontSize: 18 },
      headerTintColor: '#4F46E5',
      headerShadowVisible: false, // Cleaner look
      headerStyle: { backgroundColor: '#fff' }
    }}>
      <Stack.Screen name="my-profile" options={{ title: 'My Profile' }} />
      <Stack.Screen name="update-profile" options={{ title: 'Edit Business Profile' }} />
      <Stack.Screen name="add-service" options={{ title: 'Add New Service' }} />
      <Stack.Screen name="my-services" options={{ title: 'My Services' }} />
      <Stack.Screen name="service-details" options={{ headerShown: false }} />
      <Stack.Screen name="edit-service" options={{ title: 'Edit Service' }} />
      <Stack.Screen name="my-reviews" options={{ title: 'Ratings & Feedback' }} />
    </Stack>
  );
}