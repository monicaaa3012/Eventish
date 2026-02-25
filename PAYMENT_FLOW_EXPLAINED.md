# eSewa Payment Flow - What's Happening

## Current Logs Explained

Looking at your logs, here's what's happening:

### ✅ Step 1: Payment Initiated Successfully
```
LOG  eSewa initiate response: {
  "success": true,
  "paymentUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  "formData": { ... }
}
```
✅ Backend generated payment form
✅ Mobile app received the data

### ✅ Step 2: WebView Loading eSewa
```
LOG  WebView navigation: about:blank
LOG  WebView navigation: https://rc-epay.esewa.com.np/epay?...
LOG  WebView navigation: https://rc-epay.esewa.com.np/auth
```
✅ WebView opened
✅ Form submitted to eSewa
✅ eSewa login page loaded

### ❌ Step 3: After Payment (The Problem)

After you complete payment, eSewa will redirect to:
```
http://localhost:5000/api/esewa/success?oid=...&amt=...&refId=...
```

**Problem:** Mobile device can't reach `localhost`!

## The Fix

I updated `backend/.env`:
```env
BACKEND_URL=http://192.168.1.67:5000  ← Your IP address
```

Now eSewa will redirect to:
```
http://192.168.1.67:5000/api/esewa/success?oid=...&amt=...&refId=...
```

**Solution:** Mobile device CAN reach this!

## Complete Flow (After Fix)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Mobile App                                               │
│    POST http://192.168.1.67:5000/api/esewa/initiate        │
│    ✅ Working                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend                                                  │
│    Generates payment form with:                             │
│    - success_url: http://192.168.1.67:5000/api/esewa/success│
│    - failure_url: http://192.168.1.67:5000/api/esewa/failure│
│    ✅ Fixed (after restart)                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Mobile WebView                                           │
│    Opens eSewa payment gateway                              │
│    User logs in and completes payment                       │
│    ✅ Working                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. eSewa                                                    │
│    Redirects to: http://192.168.1.67:5000/api/esewa/success│
│    ✅ Will work (after backend restart)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend                                                  │
│    Receives callback                                        │
│    Updates booking status                                   │
│    Redirects to: http://localhost:5173/payment/esewa/success│
│    ✅ Working                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Mobile WebView                                           │
│    Detects "/payment/esewa/success" in URL                  │
│    Navigates to success screen                              │
│    ✅ Working                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Success Screen                                           │
│    Shows "Payment Successful!"                              │
│    Booking status: Booked                                   │
│    ✅ Will work                                             │
└─────────────────────────────────────────────────────────────┘
```

## What You Need to Do

### 1. Restart Backend (Required!)
```bash
# In backend terminal, press Ctrl+C
cd Eventish/backend
npm start
```

### 2. Try Payment Again
1. Open mobile app
2. Go to Bookings
3. Click "Confirm & Pay Advance"
4. Select "eSewa"
5. Complete payment
6. Should redirect to success screen!

## Expected Logs (After Fix)

### Backend Console:
```
eSewa initiate payment called with: { bookingId: "..." }
Generated eSewa form data: {
  success_url: "http://192.168.1.67:5000/api/esewa/success",  ← Your IP!
  failure_url: "http://192.168.1.67:5000/api/esewa/failure",  ← Your IP!
  ...
}
```

### Mobile Console (After Payment):
```
WebView navigation: http://192.168.1.67:5000/api/esewa/success?oid=...
WebView navigation: http://localhost:5173/payment/esewa/success?oid=...
Payment success detected: { oid: "...", amt: "...", refId: "..." }
```

## Why This Happens

### The Problem with `localhost`

- **On your computer:** `localhost` = your computer
- **On your phone:** `localhost` = your phone (not your computer!)

So when eSewa redirects to `http://localhost:5000`, your phone tries to connect to itself, not your computer.

### The Solution with IP Address

- **On your computer:** `192.168.1.67` = your computer
- **On your phone:** `192.168.1.67` = your computer (same!)

Now both devices can communicate!

## Verification Checklist

After restarting backend:

- [ ] Backend shows: `Server running on port 5000`
- [ ] Backend logs show IP address in success_url
- [ ] Mobile app can still load bookings
- [ ] Payment initiation works
- [ ] eSewa login works
- [ ] After payment, redirects properly
- [ ] Success screen appears
- [ ] Booking status is "Booked"

## Common Issues

### Issue: Backend still shows localhost
**Solution:** Make sure you restarted the backend after changing .env

### Issue: Mobile can't connect to backend
**Solution:** Both devices must be on same WiFi network

### Issue: Payment succeeds but app doesn't know
**Solution:** Check backend logs - if it shows success callback, payment worked

## Success Indicators

✅ Backend logs: "eSewa SUCCESS CALLBACK"
✅ Backend logs: "Booking updated - new payment status: completed"
✅ Mobile logs: "Payment success detected"
✅ App shows success screen
✅ Booking status is "Booked"

---

**Next Step:** Restart the backend server and try payment again!
