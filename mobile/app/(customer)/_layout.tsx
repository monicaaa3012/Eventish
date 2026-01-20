import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#4F46E5', // Your purple/blue theme color
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Back', // Specifically for iOS
      }}
    >
      {/* This ensures the 'Create Event' screen has a title */}
      <Stack.Screen 
        name="create-event" 
        options={{ 
          headerTitle: "Plan New Event",
          headerShown: true 
        }} 
      />
      {/* If you have event details, add it here too */}
      <Stack.Screen 
        name="event-details" 
        options={{ 
          headerTitle: "Event Details" 
        }} 
      />
      <Stack.Screen 
  name="recommendations" 
  options={{ 
    headerTitle: "AI Recommendations",
    headerShown: false // We use a custom header in the file
  }} 
/>
    </Stack>
  );
}