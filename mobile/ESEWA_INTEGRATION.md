# eSewa Payment Integration - Mobile App

## Overview
This mobile app integrates eSewa payment gateway for booking confirmations. When customers want to confirm a vendor booking, they can choose between cash payment or online payment via eSewa.

## Flow
1. Customer makes a booking request
2. Vendor accepts and schedules the service
3. Customer sees "Confirm & Pay Advance" button
4. Customer chooses payment method: Cash or eSewa
5. For eSewa: WebView opens with eSewa payment form
6. After payment: Customer is redirected to success/failure screen
7. Booking status changes to "Booked"

## Installation

### 1. Install react-native-webview
```bash
cd Eventish/mobile
npx expo install react-native-webview
```

### 2. Update app.json (if needed)
The WebView should work out of the box with Expo. No additional configuration needed.

## Files Created

### Payment Screens
- `app/(customer)/esewa-payment.tsx` - WebView screen that loads eSewa payment gateway
- `app/(customer)/esewa-success.tsx` - Success screen after payment
- `app/(customer)/esewa-failure.tsx` - Failure screen if payment fails

### Updated Files
- `app/(tabs)/bookings.tsx` - Added eSewa payment integration
- `config/api.ts` - Added eSewa API endpoints

## API Endpoints Used

### POST /api/esewa/initiate
Initiates eSewa payment for a booking.

**Request:**
```json
{
  "bookingId": "booking_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  "formData": {
    "amount": "1000",
    "failure_url": "http://localhost:5000/api/esewa/failure",
    "product_delivery_charge": "0",
    "product_service_charge": "0",
    "product_code": "EPAYTEST",
    "signature": "generated_signature",
    "signed_field_names": "total_amount,transaction_uuid,product_code",
    "success_url": "http://localhost:5000/api/esewa/success",
    "tax_amount": "100",
    "total_amount": "1100",
    "transaction_uuid": "unique_uuid"
  }
}
```

### GET /api/esewa/success
Backend callback - automatically updates booking status to "Booked" and redirects to mobile success screen

### GET /api/esewa/failure  
Backend callback - marks payment as failed and redirects to mobile failure screen

## How It Works

### 1. Payment Initiation
When user selects "eSewa" payment:
- App calls `/api/esewa/initiate` with booking ID
- Backend generates payment form data with signature
- Backend optimistically updates booking status to "Booked"
- App receives payment URL and form data

### 2. WebView Payment
- App navigates to `esewa-payment.tsx` screen
- WebView generates HTML form with eSewa payment data
- Form auto-submits to eSewa payment gateway
- User completes payment on eSewa

### 3. Payment Callback
- eSewa redirects to backend success/failure URL
- Backend verifies payment and updates booking
- Backend redirects to mobile app deep link
- App navigates to success/failure screen

### 4. Deep Linking
The backend redirects to:
- Success: `${FRONTEND_URL}/payment/esewa/success?oid=...&amt=...&refId=...`
- Failure: `${FRONTEND_URL}/payment/esewa/failure?pid=...`

The WebView detects these URLs and navigates to the appropriate screen.

## Configuration

### Backend Environment Variables
Make sure your backend `.env` has:
```
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

### Mobile API Configuration
Update `config/api.ts` with your server IP:
```typescript
const SERVER_URL = 'http://192.168.1.67:5000';
```

## Testing

### 1. Start Backend
```bash
cd Eventish/backend
npm start
```

### 2. Start Mobile App
```bash
cd Eventish/mobile
npm start
```

### 3. Test Flow
1. Login as a customer
2. Create a booking with a vendor
3. Wait for vendor to schedule the booking
4. Go to Bookings tab
5. Click "Confirm & Pay Advance"
6. Select "eSewa"
7. Complete payment on eSewa test environment
8. Verify booking status changes to "Booked"

## eSewa Test Credentials
- **Environment**: Test/Sandbox
- **Payment URL**: https://rc-epay.esewa.com.np/api/epay/main/v2/form
- **Merchant ID**: EPAYTEST
- **Test Cards**: Use eSewa test environment credentials

## Status Flow

1. **Pending** - Initial booking request
2. **Accepted** - Vendor accepts the booking
3. **Scheduled** - Vendor schedules the service (shows payment button)
4. **Booked** - Customer confirms with payment (cash or eSewa)
5. **In Progress** - Vendor starts the service
6. **Completed** - Vendor marks service as completed

## Troubleshooting

### WebView not loading
- Make sure `react-native-webview` is installed
- Check that JavaScript is enabled in WebView
- Verify backend URL is accessible from mobile device

### Payment not completing
- Check backend logs for eSewa callback
- Verify FRONTEND_URL and BACKEND_URL in backend .env
- Ensure mobile device can reach backend server

### Deep linking not working
- Check WebView `onNavigationStateChange` handler
- Verify success/failure URLs in backend response
- Test URL detection logic in esewa-payment.tsx

## Production Considerations

### 1. Use Production eSewa URL
Update backend `esewaConfig.js`:
```javascript
paymentUrl: 'https://epay.esewa.com.np/api/epay/main/v2/form'
```

### 2. Use Real Merchant Credentials
Replace test credentials with production:
- Merchant ID
- Secret Key

### 3. Configure Deep Linking
Set up proper deep linking in `app.json`:
```json
{
  "expo": {
    "scheme": "eventish",
    "android": {
      "intentFilters": [...]
    },
    "ios": {
      "associatedDomains": [...]
    }
  }
}
```

### 4. SSL/HTTPS
Ensure backend uses HTTPS in production for secure payment processing.

## Notes

- Payment amount is calculated from booking's `servicePrice` field
- 10% tax is automatically added to the base amount
- Transaction UUID is stored in booking for verification
- Payment status is tracked separately from booking status
- Failed payments revert booking status to "Scheduled"
