# Notification Troubleshooting Guide

## Common Issues & Solutions

### 1. "Cannot read property 'count' of undefined"

**Problem**: API response format mismatch

**Solution**: ✅ FIXED - Updated profile.tsx and notifications.tsx to handle response correctly

The `apiCall` function returns the parsed JSON directly, not wrapped in a `data` property.

**Before (Wrong)**:
```typescript
const { data } = await apiCall(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
setUnreadCount(data.count);
```

**After (Correct)**:
```typescript
const response = await apiCall(API_CONFIG.ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
const count = response?.count ?? 0;
setUnreadCount(count);
```

### 2. Backend Not Running

**Symptoms**:
- Network errors
- "Failed to fetch"
- Connection refused

**Solution**:
```bash
cd backend
npm run dev
```

Make sure you see: `Server running on port 5000`

### 3. Notification Routes Not Registered

**Check**:
```bash
# In backend/server.js, verify this line exists:
app.use("/api/notifications", notificationRoutes)
```

**Test**:
```bash
# Should return 401 (Unauthorized) not 404 (Not Found)
curl http://localhost:5000/api/notifications/unread-count
```

### 4. expo-server-sdk Not Installed

**Check**:
```bash
cd backend
npm list expo-server-sdk
```

**Install if missing**:
```bash
npm install expo-server-sdk
```

### 5. No Notifications Showing

**Possible Causes**:

a) **No notifications in database**
   - Create a booking to generate a notification
   - Check MongoDB: `db.notifications.find()`

b) **Wrong user ID**
   - Verify you're logged in
   - Check token is valid

c) **Backend error**
   - Check backend console for errors
   - Look for MongoDB connection issues

### 6. Push Notifications Not Received

**Requirements**:
- ✅ Physical device (not simulator)
- ✅ Notification permissions granted
- ✅ Push token saved to backend
- ✅ Backend has expo-server-sdk installed

**Debug Steps**:

1. Check if push token is saved:
```javascript
// In mobile app, check logs
console.log('Push token:', await Notifications.getExpoPushTokenAsync());
```

2. Verify token in database:
```javascript
// In MongoDB
db.users.findOne({ email: "your@email.com" }, { pushToken: 1 })
```

3. Test push notification manually:
   - Go to: https://expo.dev/notifications
   - Enter your push token
   - Send test notification

### 7. Badge Count Not Updating

**Solution**: Pull to refresh on profile screen

The badge count is loaded when:
- Profile screen mounts
- User pulls to refresh
- After marking notifications as read

### 8. Notifications Not Marked as Read

**Check**:
1. Tap notification (should mark as read)
2. Check network tab for PATCH request
3. Verify backend receives request

**Debug**:
```javascript
// In notifications.tsx
console.log('Marking as read:', notification._id);
```

### 9. Delete Not Working

**Possible Issues**:
- Network error
- Wrong notification ID
- Permission issue (not your notification)

**Check Backend Logs**:
```
Error deleting notification: [error message]
```

### 10. API Endpoint 404 Errors

**Verify Routes**:
```javascript
// backend/server.js should have:
import notificationRoutes from "./routes/notificationRoutes.js"
app.use("/api/notifications", notificationRoutes)
```

**Check Route File**:
```javascript
// backend/routes/notificationRoutes.js should exist
```

## Testing Checklist

### Backend Tests
- [ ] Server running on port 5000
- [ ] expo-server-sdk installed
- [ ] Notification routes registered
- [ ] MongoDB connected
- [ ] No errors in console

### Mobile Tests
- [ ] App running on physical device
- [ ] Logged in successfully
- [ ] Notification permissions granted
- [ ] Push token saved to backend
- [ ] Profile screen loads without errors
- [ ] Badge shows correct count
- [ ] Notifications screen opens
- [ ] Can tap notifications
- [ ] Can delete notifications
- [ ] Can mark all as read

### Integration Tests
- [ ] Create booking → Vendor gets notification
- [ ] Send message → Recipient gets notification
- [ ] Update booking status → Customer gets notification
- [ ] Leave review → Vendor gets notification

## Quick Fixes

### Reset Everything
```bash
# Backend
cd backend
npm install
npm run dev

# Mobile
cd mobile
npm install
npx expo start --clear
```

### Clear App Data
```bash
# On device: Settings → Apps → Eventish → Clear Data
# Or uninstall and reinstall
```

### Check Logs
```bash
# Backend logs
cd backend
npm run dev
# Watch for errors

# Mobile logs
npx expo start
# Press 'j' to open debugger
```

## API Response Formats

### GET /api/notifications
```json
[
  {
    "_id": "123",
    "type": "booking",
    "title": "New Booking Request",
    "body": "John Doe has requested...",
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "data": {
      "bookingId": "456"
    }
  }
]
```

### GET /api/notifications/unread-count
```json
{
  "count": 5
}
```

### PATCH /api/notifications/:id/read
```json
{
  "message": "Notification marked as read",
  "notification": { ... }
}
```

### DELETE /api/notifications/:id
```json
{
  "message": "Notification deleted"
}
```

## Still Having Issues?

1. **Check backend console** for errors
2. **Check mobile console** (Expo debugger)
3. **Verify MongoDB** is running and connected
4. **Test API endpoints** with Postman/curl
5. **Check network requests** in browser dev tools
6. **Restart both** backend and mobile app

## Contact Support

If issues persist:
1. Check `NOTIFICATION_SETUP.md` for setup instructions
2. Review `NOTIFICATION_QUICK_START.md` for quick reference
3. Check backend logs for specific error messages
4. Verify all files are created correctly
