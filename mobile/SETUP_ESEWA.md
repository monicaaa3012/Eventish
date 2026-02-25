# Quick Setup Guide - eSewa Payment Integration

## Step 1: Install Dependencies

```bash
cd Eventish/mobile
npx expo install react-native-webview
```

## Step 2: Verify Backend Configuration

Make sure your backend is running and has these environment variables in `Eventish/backend/.env`:

```env
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

## Step 3: Update Mobile API Configuration

Edit `Eventish/mobile/config/api.ts` and update the SERVER_URL to your local IP:

```typescript
const SERVER_URL = 'http://YOUR_LOCAL_IP:5000';
```

To find your local IP:
- **Windows**: Run `ipconfig` and look for IPv4 Address
- **Mac/Linux**: Run `ifconfig` or `ip addr`

## Step 4: Start the App

```bash
# In Eventish/backend
npm start

# In Eventish/mobile (new terminal)
npm start
```

## Step 5: Test the Integration

1. Login as a customer
2. Browse vendors and create a booking
3. Wait for vendor to accept and schedule
4. Go to Bookings tab
5. Click "Confirm & Pay Advance"
6. Choose "eSewa"
7. Complete payment in the WebView

## What's New?

### New Screens
- **eSewa Payment Screen**: WebView that loads eSewa payment gateway
- **Success Screen**: Shows payment confirmation
- **Failure Screen**: Shows payment cancellation/failure

### Updated Features
- **Bookings Tab**: Now supports both Cash and eSewa payments
- **API Config**: Added eSewa endpoints

### Payment Flow
```
Customer clicks "Confirm & Pay Advance"
    ↓
Selects "eSewa"
    ↓
App calls /api/esewa/initiate
    ↓
WebView opens with eSewa payment form
    ↓
User completes payment on eSewa
    ↓
eSewa redirects to backend callback
    ↓
Backend verifies and updates booking
    ↓
App shows success/failure screen
    ↓
Booking status updated to "Booked"
```

## Troubleshooting

### "Cannot connect to server"
- Make sure backend is running on port 5000
- Verify your mobile device is on the same network as your computer
- Update SERVER_URL in config/api.ts with correct IP

### "WebView not found"
- Run: `npx expo install react-native-webview`
- Restart the Expo development server

### "Payment not completing"
- Check backend console for errors
- Verify eSewa test credentials in backend
- Ensure FRONTEND_URL and BACKEND_URL are correct

## Need Help?

Check the detailed documentation in `ESEWA_INTEGRATION.md` for more information.
