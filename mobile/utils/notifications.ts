import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Save push token to backend
export async function savePushTokenToBackend(token: string) {
  try {
    const authToken = await AsyncStorage.getItem('token');
    if (!authToken) return;

    const response = await fetch(`${API_URL}/api/auth/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ pushToken: token }),
    });

    if (!response.ok) {
      throw new Error('Failed to save push token');
    }

    console.log('Push token saved to backend');
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

// Schedule a local notification
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 0
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });
}

// Send notification for new booking
export async function sendBookingNotification(
  recipientId: string,
  bookingDetails: {
    customerName: string;
    vendorName: string;
    serviceName?: string;
    bookingId: string;
  }
) {
  try {
    const authToken = await AsyncStorage.getItem('token');
    if (!authToken) return;

    await fetch(`${API_URL}/api/notifications/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        recipientId,
        ...bookingDetails,
      }),
    });
  } catch (error) {
    console.error('Error sending booking notification:', error);
  }
}

// Send notification for new message
export async function sendMessageNotification(
  recipientId: string,
  messageDetails: {
    senderName: string;
    messagePreview: string;
    conversationId: string;
  }
) {
  try {
    const authToken = await AsyncStorage.getItem('token');
    if (!authToken) return;

    await fetch(`${API_URL}/api/notifications/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        recipientId,
        ...messageDetails,
      }),
    });
  } catch (error) {
    console.error('Error sending message notification:', error);
  }
}

// Handle notification tap
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Handle notification received while app is in foreground
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Clear all notifications
export async function clearAllNotifications() {
  await Notifications.dismissAllNotificationsAsync();
}

// Get notification badge count
export async function getBadgeCount() {
  return await Notifications.getBadgeCountAsync();
}

// Set notification badge count
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}
