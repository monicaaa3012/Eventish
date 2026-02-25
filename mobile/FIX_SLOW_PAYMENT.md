# Fix: Payment Processing Takes Too Long

## The Problem
After logging into eSewa and completing payment, the app shows "Processing..." for a long time and doesn't redirect to the success screen.

## Why This Happens

The issue occurs because:
1. eSewa redirects to the backend server
2. Backend redirects to the web frontend URL
3. Mobile WebView can't detect the web frontend URL
4. App keeps waiting for a redirect it can detect

## The Fix (Already Applied)

I've updated the code to:
1. ✅ Detect both backend and frontend redirect URLs
2. ✅ Add better logging to see what's happening
3. ✅ Add a 60-second timeout with helpful message
4. ✅ Prevent infinite loading

## How to Test

### 1. Check Backend Logs

When payment completes, you should see in backend console:
```
=== eSewa SUCCESS CALLBACK ===
Query params: { oid: '...', amt: '...', refId: '...' }
✅ Booking found: ...
✅ Booking updated - new payment status: completed
=== END eSewa SUCCESS CALLBACK ===
```

### 2. Check Mobile Logs

In Expo console, you should see:
```
WebView navigation: http://localhost:5173/payment/esewa/success?oid=...
Payment success detected: { oid: '...', amt: '...', refId: '...' }
```

### 3. Test the Flow

1. Start a payment
2. Complete payment on eSewa
3. Watch the console logs
4. Should redirect to success screen within 5-10 seconds

## If Still Stuck

### Option 1: Check Backend Environment

Make sure your backend `.env` has:
```env
FRONTEND_URL=http://localhost:5173
```

The WebView now detects this URL pattern!

### Option 2: Manual Check

If payment seems stuck:
1. Wait for the 60-second timeout alert
2. Click "Check Bookings"
3. Verify if booking status changed to "Booked"
4. If yes, payment succeeded (just redirect issue)

### Option 3: Check Booking Status Directly

```bash
# In backend console, check the booking
# You should see payment_status: "completed"
```

## Debugging Steps

### 1. Enable More Logging

The WebView now logs every navigation:
```
WebView navigation: <url>
```

Watch for:
- eSewa payment page loading
- Redirect to backend
- Redirect to frontend
- Detection of success/failure

### 2. Check Network Tab

In Expo DevTools:
1. Open browser DevTools
2. Go to Network tab
3. Watch for redirects
4. Check final URL

### 3. Test Backend Callback

Manually test the backend callback:
```bash
# Open in browser
http://localhost:5000/api/esewa/success?oid=test&amt=1000&refId=test123
```

Should redirect to:
```
http://localhost:5173/payment/esewa/success?oid=test&amt=1000&refId=test123
```

## Common Issues

### Issue 1: WebView Not Detecting Redirect
**Symptom:** Stays on loading screen forever
**Fix:** Already fixed - now detects both `/esewa/success` and `/payment/esewa/success`

### Issue 2: Backend Not Redirecting
**Symptom:** Backend logs show success but no redirect
**Fix:** Check `FRONTEND_URL` in backend `.env`

### Issue 3: Network Timeout
**Symptom:** 60-second timeout alert appears
**Fix:** 
- Check internet connection
- Check if eSewa test server is slow
- Verify backend is responding

### Issue 4: Payment Succeeds But App Doesn't Know
**Symptom:** Booking is "Booked" but app shows failure
**Fix:** Refresh bookings list - payment actually succeeded

## Quick Diagnostic

Run through this checklist:

- [ ] Backend is running and accessible
- [ ] Backend `.env` has `FRONTEND_URL` set
- [ ] Mobile app can reach backend
- [ ] eSewa test environment is working
- [ ] Internet connection is stable
- [ ] Backend logs show success callback
- [ ] Mobile logs show WebView navigation

## Testing Tips

### Test 1: Quick Payment Test
1. Use eSewa test credentials
2. Complete payment quickly
3. Should redirect in 5-10 seconds

### Test 2: Slow Network Test
1. Enable slow network in DevTools
2. Complete payment
3. Should still work, just slower

### Test 3: Timeout Test
1. Start payment
2. Don't complete it
3. Wait 60 seconds
4. Should show timeout alert

## Success Indicators

✅ Backend logs show success callback
✅ Mobile logs show "Payment success detected"
✅ App navigates to success screen
✅ Booking status is "Booked"
✅ Payment status is "completed"

## Alternative: Force Success Screen

If payment succeeded but app is stuck, you can manually navigate:

1. Press back button to exit WebView
2. Go to Bookings tab
3. Check if booking status is "Booked"
4. If yes, payment succeeded!

## Prevention

The updated code now:
- ✅ Detects multiple URL patterns
- ✅ Has 60-second timeout
- ✅ Logs all navigation
- ✅ Handles edge cases
- ✅ Provides helpful error messages

## Still Having Issues?

### Check These:

1. **Backend Console:**
   - Does it show the success callback?
   - Any errors?

2. **Mobile Console:**
   - Does it show WebView navigation?
   - What URLs is it seeing?

3. **Database:**
   - Check booking status
   - Check payment status
   - If both updated, payment succeeded

### Get Help:

1. Copy backend console logs
2. Copy mobile console logs
3. Check booking in database
4. Share logs for debugging

## Summary

The fix is already applied! The WebView now:
- Detects both backend and frontend URLs
- Has better logging
- Has timeout protection
- Handles edge cases

Just restart your app and try again!

---

**TL;DR:** The code is updated to detect the redirect properly. Restart the app and try payment again. If it still takes too long, check the console logs to see what's happening.
