# Troubleshooting 504 Gateway Timeout Error

## Problem
Getting "504 Gateway Timeout" when trying to initiate eSewa payment from mobile app.

## Root Cause
The mobile app cannot reach the backend server at the configured IP address.

## Solutions

### Solution 1: Verify Backend is Running

1. **Check if backend is running:**
   ```bash
   cd Eventish/backend
   npm start
   ```

2. **Verify it's running on port 5000:**
   - You should see: `Server running on port 5000`
   - Check for any errors in the console

### Solution 2: Find Your Correct IP Address

The IP address `192.168.1.67` in `config/api.ts` might be incorrect.

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (WiFi or Ethernet)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```
Look for `inet` address (not 127.0.0.1)

**Example output:**
```
IPv4 Address: 192.168.1.100  ← Use this IP
```

### Solution 3: Update Mobile API Configuration

1. Open `Eventish/mobile/config/api.ts`

2. Update the SERVER_URL with your correct IP:
   ```typescript
   const SERVER_URL = 'http://YOUR_CORRECT_IP:5000';
   ```

3. Save the file

4. Restart the Expo development server:
   ```bash
   # Press 'r' in the terminal to reload
   # Or stop and restart: npm start
   ```

### Solution 4: Test Backend Connectivity

**From your computer's browser:**
```
http://localhost:5000/api/bookings/customer
```
Should return data or authentication error (not 404)

**From your mobile device's browser:**
```
http://YOUR_IP:5000/api/bookings/customer
```
Should return the same response

If mobile browser can't reach it, there's a network issue.

### Solution 5: Check Firewall Settings

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find Node.js or add it
4. Allow both Private and Public networks

**Mac Firewall:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add Node.js if needed

### Solution 6: Ensure Same Network

**Both devices must be on the same WiFi network:**
- Computer running backend: Connected to WiFi
- Mobile device: Connected to SAME WiFi
- Not using mobile data
- Not using VPN

### Solution 7: Use Alternative Testing Method

If you can't get the IP working, test with Expo tunnel:

1. Start Expo with tunnel:
   ```bash
   cd Eventish/mobile
   npx expo start --tunnel
   ```

2. Update `config/api.ts`:
   ```typescript
   const SERVER_URL = 'http://localhost:5000';
   ```

Note: This is slower but works across networks.

### Solution 8: Check Backend Logs

When you try to make a payment, check the backend console for:
- Incoming request logs
- Any error messages
- 404 errors (wrong route)
- Authentication errors

### Solution 9: Test API Endpoint Directly

**Using curl (from computer):**
```bash
curl -X POST http://localhost:5000/api/esewa/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"bookingId":"BOOKING_ID"}'
```

**Using Postman:**
1. POST to `http://localhost:5000/api/esewa/initiate`
2. Add Authorization header with Bearer token
3. Add JSON body: `{"bookingId": "your_booking_id"}`
4. Send request

If this works, the backend is fine - it's a network issue.

## Quick Diagnostic Checklist

- [ ] Backend is running (`npm start` in backend folder)
- [ ] Backend shows "Server running on port 5000"
- [ ] Found correct IP address using `ipconfig` or `ifconfig`
- [ ] Updated `config/api.ts` with correct IP
- [ ] Restarted Expo development server
- [ ] Both devices on same WiFi network
- [ ] Firewall allows Node.js connections
- [ ] Can access backend from mobile browser
- [ ] No VPN active on either device

## Testing Steps

1. **Test from computer browser:**
   ```
   http://localhost:5000/api/bookings/customer
   ```
   Expected: JSON response or auth error

2. **Test from mobile browser:**
   ```
   http://YOUR_IP:5000/api/bookings/customer
   ```
   Expected: Same response as above

3. **Test from mobile app:**
   - Try to create a booking
   - Check if bookings load
   - Try payment

## Common Issues

### Issue: "Network request failed"
**Solution:** Wrong IP address or firewall blocking

### Issue: "404 Not Found"
**Solution:** Wrong endpoint path or routes not registered

### Issue: "401 Unauthorized"
**Solution:** Token issue (but at least backend is reachable!)

### Issue: "504 Gateway Timeout"
**Solution:** Backend not reachable from mobile device

## Verification Commands

**Check if port 5000 is listening (Windows):**
```bash
netstat -ano | findstr :5000
```

**Check if port 5000 is listening (Mac/Linux):**
```bash
lsof -i :5000
# or
netstat -an | grep 5000
```

## Alternative: Use ngrok (Advanced)

If nothing else works, use ngrok to expose your backend:

1. Install ngrok: https://ngrok.com/download

2. Start ngrok:
   ```bash
   ngrok http 5000
   ```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. Update `config/api.ts`:
   ```typescript
   const SERVER_URL = 'https://abc123.ngrok.io';
   ```

5. Update backend `.env`:
   ```
   BACKEND_URL=https://abc123.ngrok.io
   ```

6. Restart both backend and mobile app

## Still Not Working?

### Debug Mode

Add more logging to see what's happening:

**In `config/api.ts`, update apiCall function:**
```typescript
console.log(`[API] Calling: ${url}`);
console.log(`[API] Headers:`, headers);
console.log(`[API] Body:`, options.body);

try {
  const response = await fetch(url, requestOptions);
  console.log(`[API] Response status:`, response.status);
  console.log(`[API] Response headers:`, response.headers);
  // ... rest of code
```

### Check Network Tab

In Expo DevTools:
1. Open DevTools in browser
2. Go to Network tab
3. Try payment
4. Check the failed request details

## Success Indicators

✅ Backend console shows: `[API] Calling: http://YOUR_IP:5000/api/esewa/initiate`
✅ Backend console shows: `eSewa initiate payment called with: { bookingId: "..." }`
✅ Mobile app shows: "Processing" alert
✅ WebView opens with payment form

## Need More Help?

1. Check backend console for errors
2. Check mobile app console for errors
3. Verify network connectivity
4. Try alternative solutions above
5. Use ngrok as last resort

---

**Most Common Fix:** Update the IP address in `config/api.ts` with your actual computer's IP address!
