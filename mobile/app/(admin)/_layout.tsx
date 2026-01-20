import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false, // We'll handle headers in individual screens
      headerTitleStyle: { fontWeight: '800', fontSize: 18 },
      headerTintColor: '#4F46E5',
      headerShadowVisible: false,
      headerStyle: { backgroundColor: '#fff' }
    }}>
      <Stack.Screen name="vendor-details" options={{ title: 'Vendor Details' }} />
    </Stack>
  );
}