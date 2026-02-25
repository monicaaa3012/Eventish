# IMPORTANT: Restart Backend Server

## What Changed

I updated your backend `.env` file:

**Before:**
```env
BACKEND_URL=http://localhost:5000
```

**After:**
```env
BACKEND_URL=http://192.168.1.67:5000
```

## Why This Matters

When eSewa completes the payment, it redirects to:
- Success: `{BACKEND_URL}/api/esewa/success`
- Failure: `{BACKEND_URL}/api/esewa/failure`

With `localhost`, the mobile WebView can't reach these URLs. With your IP address, it can!

## What to Do Now

### 1. Stop the Backend Server
In the terminal running the backend, press `Ctrl+C`

### 2. Restart the Backend
```bash
cd Eventish/backend
npm start
```

### 3. Verify It Started
You should see:
```
Server running on port 5000
```

### 4. Test Payment Again
1. Go to mobile app
2. Navigate to Bookings
3. Click "Confirm & Pay Advance"
4. Select "eSewa"
5. Complete payment
6. Should now redirect properly!

## What Will Happen Now

After completing payment on eSewa:
1. eSewa redirects to: `http://192.168.1.67:5000/api/esewa/success?oid=...&amt=...&refId=...`
2. Backend processes the payment
3. Backend redirects to: `http://localhost:5173/payment/esewa/success?...`
4. WebView detects the `/payment/esewa/success` URL
5. App navigates to success screen
6. Payment complete! 🎉

## Verification

After restarting backend, check the logs when you initiate payment. You should see:
```
Generated eSewa form data: {
  success_url: "http://192.168.1.67:5000/api/esewa/success",
  failure_url: "http://192.168.1.67:5000/api/esewa/failure",
  ...
}
```

## Important Notes

- ✅ Backend must use your IP address (not localhost)
- ✅ Mobile app must use same IP address
- ✅ Both must be on same WiFi network
- ✅ Backend must be restarted after .env changes

## If You Change Networks

If you connect to a different WiFi network, you'll need to:
1. Find your new IP address (`ipconfig` on Windows)
2. Update `backend/.env` with new IP
3. Update `mobile/config/api.ts` with new IP
4. Restart backend
5. Restart mobile app

---

**TL;DR:** Stop the backend (Ctrl+C) and restart it (`npm start`). Then try payment again!
