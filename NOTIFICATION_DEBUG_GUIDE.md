# Notification System Debug Guide

## Issue: Notifications Not Showing After Booking

### Root Cause
The backend needs to be **restarted** to load the new notification code.

## Solution Steps

### 1. Restart Backend (REQUIRED!)

```bash
# Stop current backend (Ctrl+C)
cd backend
npm run dev
```

**Verify you see:**
```
Server running on port 5000
```

### 2. Test the System

Run the test script:
```bash
cd backend
node testNotificationSystem.js
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Test notification created
📱 Found X users with push tokens
📬 Found X recent notifications
✅ Test notification sent
```

### 3. Create a Test Booking

**On Customer Device:**
1. Login as customer
2. Browse vendors
3. Select a vendor
4. Create a booking

**Watch Backend Console:**
You should see:
```
📧 Sending booking notification to vendor: [userId]
💾 Saving notification to database...
✅ Notification saved to database with ID: [id]
📤 Sending push notification via Expo...
✅ Push notification sent successfully
```

**On Vendor Device:**
1. Login as vendor
2. Go to Profile tab
3. See badge with "1" on Notifications
4. Tap Notifications
5. See "New Booking Request" notification

## Common Issues & Fixes

### Issue 1: No Backend Logs
**Problem:** Backend not restarted
**Fix:** Stop backend (Ctrl+C) and restart with `npm run dev`

### Issue 2: "No push token found"
**Problem:** User hasn't opened app or granted permissions
**Fix:** 
- Notification still saved to database
- User will see it in notifications screen
- For push notifications, user must open app on physical device

### Issue 3: Notification in DB but Not Showing
**Problem:** Mobile app not refreshing
**Fix:** Pull to refresh on notifications screen

### Issue 4: Backend Error on Startup
**Problem:** Missing dependency
**Fix:**
```bash
cd backend
npm install expo-server-sdk
npm run dev
```

### Issue 5: "Invalid Expo push token"
**Problem:** Testing on simulator
**Fix:** Test on physical device only

## Verification Checklist

### Backend
- [ ] Backend restarted after adding notification code
- [ ] No errors on startup
- [ ] `expo-server-sdk` installed
- [ ] MongoDB connected
- [ ] Notification routes registered (`/api/notifications`)

### Database
- [ ] Notification model created
- [ ] Users have `pushToken` field
- [ ] Notifications collection exists

### Mobile App
- [ ] Testing on physical devices (not simulators)
- [ ] Notification permissions granted
- [ ] Push token saved to backend
- [ ] Both customer and vendor logged in

## Debug Commands

### Check Backend Routes
```bash
# Should return 401 (Unauthorized), not 404 (Not Found)
curl http://localhost:5000/api/notifications/unread-count
```

### Check MongoDB
```javascript
// Check notifications
db.notifications.find().sort({ createdAt: -1 }).limit(5)

// Check users with push tokens
db.users.find({ pushToken: { $exists: true } }, { name: 1, email: 1, pushToken: 1 })
```

### Check Mobile Logs
Look for:
```
[API] Calling: http://192.168.1.67:5000/api/notifications
```

## Expected Flow

### 1. Customer Creates Booking
```
Customer App → POST /api/bookings
    ↓
Backend: bookingController.createBooking()
    ↓
Backend: sendBookingNotificationToVendor()
    ↓
Backend: Save to Notification collection
    ↓
Backend: Send push notification via Expo
    ↓
Vendor Device: Receives push notification
```

### 2. Vendor Checks Notifications
```
Vendor App → Profile Tab
    ↓
Badge shows "1"
    ↓
Tap Notifications
    ↓
GET /api/notifications
    ↓
Shows "New Booking Request"
```

## Backend Logs to Watch For

### Successful Notification:
```
📧 Sending booking notification to vendor: 67890abcdef
💾 Saving notification to database...
✅ Notification saved to database with ID: 12345xyz
📤 Sending push notification via Expo...
✅ Push notification sent successfully
```

### No Push Token (Still Works):
```
📧 Sending booking notification to vendor: 67890abcdef
💾 Saving notification to database...
✅ Notification saved to database with ID: 12345xyz
⚠️ No push token found for user 67890abcdef
```
*Note: Notification still saved to DB, user will see it in app*

### Error:
```
❌ Error in sendPushNotification: [error message]
```
*Check error message for specific issue*

## Testing Without Push Notifications

You can test the notification system even without push tokens:

1. **Create booking** (customer device)
2. **Check backend logs** for "✅ Notification saved to database"
3. **Login as vendor** (vendor device)
4. **Go to Profile → Notifications**
5. **Pull to refresh**
6. **Should see notification**

This works because notifications are always saved to the database, regardless of push token availability.

## Quick Fix Commands

### Restart Everything
```bash
# Backend
cd backend
npm install
npm run dev

# Mobile (in another terminal)
cd mobile
npx expo start --clear
```

### Check Installation
```bash
cd backend
npm list expo-server-sdk
# Should show: expo-server-sdk@6.0.0
```

### Test Notification Endpoint
```bash
# Get a JWT token from mobile app (check AsyncStorage)
# Then test:
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/notifications/unread-count
```

## Still Not Working?

1. **Check backend console** for errors
2. **Run test script**: `node testNotificationSystem.js`
3. **Check MongoDB** for notifications collection
4. **Verify routes** in server.js
5. **Check mobile logs** for API calls
6. **Test on physical device** (not simulator)

## Success Indicators

✅ Backend shows notification logs
✅ Notification appears in MongoDB
✅ Vendor sees badge on Profile
✅ Notification appears in list
✅ Tapping notification navigates correctly
✅ Can mark as read
✅ Can delete notification

## Need More Help?

Check these files:
- `NOTIFICATION_SETUP.md` - Full setup guide
- `NOTIFICATION_QUICK_START.md` - Quick reference
- `NOTIFICATION_TROUBLESHOOTING.md` - Detailed troubleshooting
- `RESTART_BACKEND_FOR_NOTIFICATIONS.md` - Restart instructions
