# Push Notifications Setup Guide

This guide explains how to set up and use push notifications in the Eventish mobile app.

## Overview

The notification system sends push notifications for:
- **Booking notifications** - When a customer books a vendor
- **Booking status updates** - When vendor updates booking status (Scheduled, Booked, Completed, Cancelled)
- **Message notifications** - When users/vendors receive chat messages
- **Review notifications** - When a customer leaves a review for a vendor

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install expo-server-sdk
```

### 2. Files Created/Modified

#### New Files:
- `models/Notification.js` - Database model for notifications
- `utils/pushNotifications.js` - Push notification utility functions
- `controllers/notificationController.js` - Notification API endpoints
- `routes/notificationRoutes.js` - Notification routes

#### Modified Files:
- `models/User.js` - Added `pushToken` field
- `controllers/authController.js` - Added `savePushToken` endpoint
- `routes/authRoutes.js` - Added push token route
- `controllers/bookingController.js` - Added notification triggers
- `utils/socket.js` - Added message notification triggers
- `server.js` - Added notification routes

### 3. Environment Variables

No additional environment variables needed. The system uses Expo's push notification service.

## Mobile App Setup

### 1. Dependencies (Already Installed)

The `expo-notifications` package is already in your package.json.

### 2. Files Created/Modified

#### New Files:
- `utils/notifications.ts` - Notification utility functions

#### Modified Files:
- `app/_layout.tsx` - Notification initialization and handling

### 3. Configure app.json

Update your `app.json` to include notification configuration:

```json
{
  "expo": {
    "notification": {
      "icon": "./assets/images/icon.png",
      "color": "#ffffff",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "useNextNotificationsApi": true,
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "supportsTabletOnly": false,
      "bundleIdentifier": "com.eventish.app"
    }
  }
}
```

## How It Works

### 1. User Registration for Notifications

When the app starts (`_layout.tsx`):
1. Requests notification permissions from the user
2. Gets an Expo Push Token
3. Sends the token to backend (`/api/auth/push-token`)
4. Backend saves token in User model

### 2. Sending Notifications

#### Booking Notifications
When a customer creates a booking:
```javascript
// In bookingController.js - createBooking()
await sendBookingNotificationToVendor(vendorUserId, {
  customerName: "John Doe",
  serviceName: "Wedding Photography",
  bookingId: "123abc"
});
```

#### Booking Status Notifications
When vendor updates booking status:
```javascript
// In bookingController.js - updateBookingStatus()
await sendBookingStatusNotification(customerUserId, {
  status: "Scheduled",
  vendorName: "ABC Photography",
  bookingId: "123abc"
});
```

#### Message Notifications
When a message is sent via Socket.IO:
```javascript
// In socket.js - send_message event
await sendMessageNotification(receiverId, {
  senderName: "John Doe",
  messagePreview: "Hello, I have a question...",
  conversationId: "conv123",
  senderId: "user123"
});
```

#### Review Notifications
When a customer leaves a review:
```javascript
// In bookingController.js - addBookingReview()
await sendReviewNotification(vendorUserId, {
  customerName: "John Doe",
  rating: 5,
  bookingId: "123abc"
});
```

### 3. Receiving Notifications

#### When App is Open (Foreground)
```typescript
// In _layout.tsx
addNotificationReceivedListener(notification => {
  console.log('Notification received:', notification);
  // Show in-app notification or update UI
});
```

#### When User Taps Notification
```typescript
// In _layout.tsx
addNotificationResponseListener(response => {
  const data = response.notification.request.content.data;
  
  if (data?.type === 'booking') {
    router.push('/(tabs)/bookings');
  }
  
  if (data?.type === 'message') {
    router.push(`/chat/${data.conversationId}`);
  }
});
```

## API Endpoints

### Save Push Token
```
POST /api/auth/push-token
Authorization: Bearer <token>
Body: { "pushToken": "ExponentPushToken[...]" }
```

### Get Notifications
```
GET /api/notifications
Authorization: Bearer <token>
```

### Get Unread Count
```
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

### Mark as Read
```
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

### Delete Notification
```
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

## Testing Notifications

### 1. Test on Physical Device
Push notifications only work on physical devices, not simulators/emulators.

### 2. Test Booking Notification
1. Login as a customer
2. Book a vendor service
3. Vendor should receive a push notification

### 3. Test Message Notification
1. Login as customer and vendor on different devices
2. Send a message from one to the other
3. Recipient should receive a push notification

### 4. Test with Expo Push Tool
Visit: https://expo.dev/notifications

Enter your Expo Push Token and send a test notification.

## Notification Data Structure

Each notification includes:
```typescript
{
  title: string,           // Notification title
  body: string,            // Notification message
  data: {
    type: string,          // 'booking', 'message', 'booking_status', 'review'
    bookingId?: string,    // For booking notifications
    conversationId?: string, // For message notifications
    senderId?: string,     // For message notifications
    status?: string,       // For booking status notifications
    rating?: number        // For review notifications
  }
}
```

## Troubleshooting

### Notifications Not Received
1. Check if push token is saved in database
2. Verify user has granted notification permissions
3. Ensure you're testing on a physical device
4. Check backend logs for errors

### Invalid Push Token Error
1. Token format should be: `ExponentPushToken[...]`
2. Regenerate token by clearing app data and restarting

### Notifications Not Opening Correct Screen
1. Check the `data` object in notification
2. Verify routing logic in `_layout.tsx`
3. Ensure screen routes match your app structure

## Production Considerations

### 1. APNs (iOS)
For production iOS apps, you need:
- Apple Developer account
- APNs key configured in Expo

### 2. FCM (Android)
For production Android apps, you need:
- Firebase project
- `google-services.json` file
- FCM server key configured in Expo

### 3. Notification Channels (Android)
Customize notification channels in `utils/notifications.ts`:
```typescript
await Notifications.setNotificationChannelAsync('bookings', {
  name: 'Booking Notifications',
  importance: Notifications.AndroidImportance.HIGH,
});
```

### 4. Badge Count
Update badge count when notifications are received:
```typescript
import { setBadgeCount } from '../utils/notifications';

// Increment badge
const currentCount = await getBadgeCount();
await setBadgeCount(currentCount + 1);

// Clear badge when user opens app
await setBadgeCount(0);
```

## Next Steps

1. **Install backend dependency**: `npm install expo-server-sdk` in backend folder
2. **Restart backend server**: The new routes and models need to be loaded
3. **Test on physical device**: Install app on a real phone
4. **Customize notification content**: Edit messages in `pushNotifications.js`
5. **Add notification UI**: Create a notifications screen to show notification history
6. **Add badge indicators**: Show unread count on tabs/icons

## Additional Features to Implement

- [ ] Notification preferences (allow users to enable/disable certain types)
- [ ] Notification history screen in mobile app
- [ ] Badge count on Messages and Bookings tabs
- [ ] Sound customization per notification type
- [ ] Scheduled notifications (reminders for upcoming bookings)
- [ ] Rich notifications with images
- [ ] Action buttons on notifications (Accept/Decline booking)
