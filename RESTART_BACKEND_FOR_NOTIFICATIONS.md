# Restart Backend for Notifications

## Important: Backend Must Be Restarted!

The notification system requires the backend to be restarted to load:
- New notification routes
- New notification model
- Push notification utilities
- Updated booking controller

## How to Restart

### Step 1: Stop Current Backend
Press `Ctrl+C` in the terminal running the backend

### Step 2: Restart Backend
```bash
cd backend
npm run dev
```

### Step 3: Verify Server Started
You should see:
```
Server running on port 5000
```

## Test Notifications

### 1. Create a Booking
- Login as customer on one device
- Book a vendor service
- Watch backend console for logs

### Expected Backend Logs:
```
📧 Sending booking notification to vendor: [userId]
💾 Saving notification to database...
✅ Notification saved to database with ID: [notificationId]
📤 Sending push notification via Expo...
✅ Push notification sent successfully
```

### 2. Check Vendor Notifications
- Login as vendor on another device
- Go to Profile → Notifications
- Should see "New Booking Request" notification

## Troubleshooting

### No Logs Appearing
- Backend not restarted
- Solution: Stop and restart backend

### "No push token found"
- User hasn't opened the app yet
- Notification still saved to database
- User will see it when they open notifications screen

### "Invalid Expo push token"
- Testing on simulator (won't work)
- Solution: Test on physical device

### Notification in Database but Not Showing
- Pull to refresh on notifications screen
- Check API call logs in mobile app

### Backend Error on Startup
```bash
# Install missing dependency
npm install expo-server-sdk

# Restart
npm run dev
```

## Debug Checklist

- [ ] Backend restarted after adding notification code
- [ ] No errors on backend startup
- [ ] expo-server-sdk installed
- [ ] MongoDB connected
- [ ] Notification routes registered
- [ ] Testing on physical devices
- [ ] Both users logged in
- [ ] Push tokens saved (check User model in DB)

## Quick Test Without Push Notifications

Even without push tokens, notifications are saved to the database:

1. Create a booking
2. Check backend logs for "✅ Notification saved to database"
3. Login as vendor
4. Go to Profile → Notifications
5. Pull to refresh
6. Should see notification

## MongoDB Check

To verify notifications are being saved:

```javascript
// In MongoDB shell or Compass
db.notifications.find().sort({ createdAt: -1 }).limit(5)
```

Should show recent notifications with:
- recipient (vendor user ID)
- type: "booking"
- title: "New Booking Request"
- body: "[Customer] has requested..."

## Next Steps After Restart

1. ✅ Backend restarted
2. ✅ Create test booking
3. ✅ Check backend logs
4. ✅ Verify notification in database
5. ✅ Check vendor notifications screen
6. ✅ Test push notification on physical device
