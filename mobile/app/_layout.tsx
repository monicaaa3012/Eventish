import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthUtils } from '../utils/auth'; // Ensure this path is correct

export const unstable_settings = {
  // We remove initialRouteName so the useEffect can decide where to go
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments(); // This tells us which folder the user is currently in
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AuthUtils.getToken();
        const inAuthGroup = segments[0] === '(auth)';

        if (!token && !inAuthGroup) {
          // 1. Not logged in? Force them to login screen
          router.replace('/(auth)/login');
        } else if (token && inAuthGroup) {
          // 2. Already logged in? Don't let them see login, send to dashboard
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error("Auth redirect error:", error);
      } finally {
        // 3. Only show the app once we've decided where to send them
        setIsReady(true);
      }
    };

    checkAuthStatus();
  }, [segments]); // Re-run whenever the user changes screens

  // Show a loading screen while checking the token
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}