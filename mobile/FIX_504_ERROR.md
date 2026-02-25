# Quick Fix: 504 Gateway Timeout Error

## The Problem
You're getting a "504 Gateway Timeout" error when trying to pay with eSewa.

## The Solution (3 Steps)

### Step 1: Find Your IP Address

**Run this command:**
```bash
cd Eventish/mobile
find-ip.bat
```

This will show your IP address. Look for something like:
```
IPv4 Address: 192.168.1.100
```

**Or manually find it:**
- Windows: Open CMD and type `ipconfig`
- Mac/Linux: Open Terminal and type `ifconfig`

### Step 2: Update Mobile Config

1. Open `Eventish/mobile/config/api.ts`

2. Find this line:
   ```typescript
   const SERVER_URL = 'http://192.168.1.67:5000';
   ```

3. Replace `192.168.1.67` with YOUR IP address:
   ```typescript
   const SERVER_URL = 'http://192.168.1.100:5000';  // Use YOUR IP!
   ```

4. Save the file

### Step 3: Restart Everything

1. **Stop the mobile app** (Ctrl+C in terminal)

2. **Restart mobile app:**
   ```bash
   cd Eventish/mobile
   npm start
   ```

3. **Press 'r' in the terminal** to reload the app

4. **Try payment again**

## Verify It's Working

### Test 1: Check Backend
Open your computer's browser and go to:
```
http://localhost:5000/api/bookings/customer
```
You should see JSON data or an authentication error (not 404).

### Test 2: Check from Mobile
Open your phone's browser and go to:
```
http://YOUR_IP:5000/api/bookings/customer
```
(Replace YOUR_IP with the IP you found in Step 1)

You should see the same response as Test 1.

### Test 3: Try Payment
1. Open the app
2. Go to Bookings
3. Click "Confirm & Pay Advance"
4. Select "eSewa"
5. Should work now!

## Still Not Working?

### Check These:

1. **Is backend running?**
   ```bash
   cd Eventish/backend
   npm start
   ```
   Should show: "Server running on port 5000"

2. **Same WiFi network?**
   - Computer: Check WiFi connection
   - Phone: Check WiFi connection
   - Must be the SAME network!

3. **Firewall blocking?**
   - Windows: Allow Node.js through firewall
   - Mac: Check System Preferences → Security

4. **VPN active?**
   - Turn off VPN on both devices

## Quick Diagnostic

Run these commands to check:

**Check if backend is running:**
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

If nothing shows up, backend isn't running!

## Alternative Solution: Use Localhost (Testing Only)

If you're using an Android emulator (not real device):

1. Update `config/api.ts`:
   ```typescript
   const SERVER_URL = 'http://10.0.2.2:5000';  // Android emulator
   ```

2. Restart app

## Error Messages Explained

| Error | Meaning | Fix |
|-------|---------|-----|
| 504 Gateway Timeout | Can't reach backend | Update IP address |
| Network request failed | Can't connect | Check WiFi/Firewall |
| 404 Not Found | Wrong endpoint | Check backend is running |
| 401 Unauthorized | Token issue | Login again |

## Success Indicators

✅ Backend console shows incoming request
✅ Mobile app shows "Processing" alert
✅ WebView opens with eSewa form
✅ No timeout errors

## Need More Help?

See detailed troubleshooting: `TROUBLESHOOTING_504.md`

---

**TL;DR:** Update the IP address in `config/api.ts` with your computer's actual IP address, then restart the app!
