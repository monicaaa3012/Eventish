# Notification Quick Start

## What's Been Done

✅ Push notification system fully implemented for:
- Booking requests (vendor gets notified)
- Booking status updates (customer gets notified)
- Chat messages (recipient gets notified)
- Reviews (vendor gets notified)

## Installation (3 Steps)

### Step 1: Install Backend Dependency
```bash
cd backend
npm install expo-server-sdk
```

Or run: `INSTALL_NOTIFICATIONS.bat`

### Step 2: Restart Backend
```bash
cd backend
npm run dev
```

### Step 3: Test on Physical Device
- Push notifications ONLY work on real phones
- Not on emulators/simulators
- Install your app on a physical device

## How to Test

### Test 1: Booking Notification
1. Login as customer on Device A
2. Book a vendor service
3. Login as that vendor on Device B
4. Device B should receive notification: "New Booking Request"

### Test 2: Message Notification
1. Login as customer on Device A
2. Login as vendor on Device B
3. Send message from Device A
4. Device B should receive notification with message preview

### Test 3: Status Update Notification
1. Login as vendor on Device A
2. Update a booking status to "Scheduled"
3. Login as customer on Device B
4. Device B should receive notification: "Your booking has been scheduled"

## Files Modified

### Backend
- ✅ `models/User.js` - Added pushToken field
- ✅ `models/Notification.js` - NEW: Notification database model
- ✅ `controllers/authController.js` - Added savePushToken endpoint
- ✅ `controllers/bookingController.js` - Added notification triggers
- ✅ `controllers/notificationController.js` - NEW: Notification API
- ✅ `routes/authRoutes.js` - Added push token route
- ✅ `routes/notificationRoutes.js` - NEW: Notification routes
- ✅ `utils/pushNotifications.js` - NEW: Push notification functions
- ✅ `utils/socket.js` - Added message notifications
- ✅ `server.js` - Added notification routes

### Mobile
- ✅ `utils/notifications.ts` - NEW: Notification utilities
- ✅ `app/_layout.tsx` - Added notification initialization

## Notification Flow

```
User Action → Backend Trigger → Get Push Token → Send Notification → User Receives
```

### Example: Booking Flow
```
Customer books vendor
    ↓
bookingController.createBooking()
    ↓
sendBookingNotificationToVendor()
    ↓
Get vendor's pushToken from database
    ↓
Send via Expo Push Service
    ↓
Vendor receives notification on phone
```

## API Endpoints Added

```
POST   /api/auth/push-token              - Save device push token
GET    /api/notifications                - Get user notifications
GET    /api/notifications/unread-count   - Get unread count
PATCH  /api/notifications/:id/read       - Mark as read
PATCH  /api/notifications/read-all       - Mark all as read
DELETE /api/notifications/:id            - Delete notification
```

## Notification Types

| Type | Trigger | Recipient | Title |
|------|---------|-----------|-------|
| `booking` | Customer books vendor | Vendor | "New Booking Request" |
| `booking_status` | Vendor updates status | Customer | "Booking Status Update" |
| `message` | Message sent | Recipient | "Message from [Name]" |
| `review` | Customer leaves review | Vendor | "New Review" |

## Troubleshooting

### "No push token found"
- User hasn't granted notification permissions
- App hasn't registered for notifications yet
- Solution: Restart app, grant permissions

### "Invalid Expo push token"
- Token format is wrong
- Solution: Clear app data and reinstall

### Notifications not received
- Testing on simulator/emulator (won't work)
- Backend not running
- Push token not saved to database
- Solution: Test on physical device, check backend logs

## What Happens When User Taps Notification

```typescript
// In _layout.tsx
if (data?.type === 'booking') {
  router.push('/(tabs)/bookings');  // Opens bookings screen
}

if (data?.type === 'message') {
  router.push(`/chat/${conversationId}`);  // Opens specific chat
}
```

## Production Setup (Later)

For production apps, you'll need:
- **iOS**: Apple Developer account + APNs key
- **Android**: Firebase project + FCM configuration

But for development/testing, Expo handles everything automatically!

## Next Features to Add

- [ ] Notification history screen
- [ ] Badge count on tabs
- [ ] Notification preferences
- [ ] Sound customization
- [ ] Rich notifications with images

## Need Help?

Check the full guide: `NOTIFICATION_SETUP.md`
