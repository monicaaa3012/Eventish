# eSewa Integration - Quick Start Guide

## Overview
This guide provides a quick reference for the eSewa payment integration following official eSewa ePay documentation.

## Key Features Implemented

✅ Official eSewa transaction flow  
✅ HMAC-SHA256 signature generation  
✅ Payment verification with eSewa API  
✅ 5-minute timeout with status check  
✅ Success/failure callback handling  
✅ Mobile (React Native) support  
✅ Web (React) support  
✅ Secure payment processing  

## Quick Test Flow

### 1. Start Backend
```bash
cd Eventish/backend
npm install
npm start
```

### 2. Start Frontend (Web)
```bash
cd Eventish/frontend
npm install
npm run dev
```

### 3. Start Mobile App
```bash
cd Eventish/mobile
npm install
npx expo start
```

### 4. Test Payment

**Mobile:**
1. Navigate to Bookings tab
2. Select a "Scheduled" booking
3. Choose "eSewa" payment option
4. Complete payment in WebView
5. Verify success/failure redirect

**Web:**
1. Go to Bookings page
2. Click "Confirm with Payment" on a scheduled booking
3. Choose "Online Payment"
4. Complete payment on eSewa page
5. Verify redirect back to success page

## API Endpoints

### Backend Routes (`/api/esewa`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/initiate` | Start payment process | ✓ |
| GET | `/success` | Handle success callback | ✗ |
| GET | `/failure` | Handle failure callback | ✗ |
| GET | `/status/:bookingId` | Check payment status | ✓ |

## Payment Flow Diagram

```
User → Initiate Payment → Backend Creates Transaction
                              ↓
                         Generate Signature
                              ↓
                    Return Payment URL + Form Data
                              ↓
                    Mobile/Web Opens eSewa
                              ↓
                    User Completes Payment
                              ↓
                ┌─────────────┴─────────────┐
                ↓                           ↓
           Success URL                 Failure URL
                ↓                           ↓
        Verify with API              Revert Booking
                ↓                           ↓
        Update Booking              Mark as Failed
                ↓                           ↓
        Redirect User               Redirect User
```

## Configuration Files

### Backend
- `backend/utils/esewaConfig.js` - eSewa configuration and helpers
- `backend/controllers/esewaController.js` - Payment logic
- `backend/routes/esewaRoutes.js` - API routes

### Mobile
- `mobile/app/(customer)/esewa-payment.tsx` - WebView payment screen
- `mobile/app/(customer)/esewa-success.tsx` - Success screen
- `mobile/app/(customer)/esewa-failure.tsx` - Failure screen
- `mobile/config/api.ts` - API configuration

### Web
- `frontend/src/pages/payment/EsewaSuccess.jsx` - Success page
- `frontend/src/pages/payment/EsewaFailure.jsx` - Failure page
- `frontend/src/pages/bookings/BookingManagement.jsx` - Payment initiation

## Environment Setup

### Backend `.env`
```env
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# eSewa Test Credentials
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
```

### Mobile `config/api.ts`
```typescript
const SERVER_URL = 'http://192.168.1.67:5000'; // Your local IP
```

## Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend/Mobile can reach backend
- [ ] Payment initiation works
- [ ] WebView/Form opens eSewa
- [ ] Success callback received
- [ ] Failure callback received
- [ ] Status check API works
- [ ] Booking status updates correctly
- [ ] 5-minute timeout triggers status check

## Common Issues & Solutions

### Issue: Payment form doesn't submit
**Solution:** Check that all form fields are present and signature is correct

### Issue: Callback not received
**Solution:** Ensure callback URLs are accessible from eSewa servers (use ngrok for local testing)

### Issue: Signature mismatch
**Solution:** Verify secret key and signature format match exactly

### Issue: 5-minute timeout not working
**Solution:** Check that bookingId is passed to payment screen

### Issue: Status check fails
**Solution:** Verify eSewa API URL and transaction UUID are correct

## Production Deployment

### Before Going Live:

1. **Update Credentials**
   ```javascript
   merchantId: "YOUR_PRODUCTION_MERCHANT_ID"
   secretKey: "YOUR_PRODUCTION_SECRET_KEY"
   ```

2. **Update URLs**
   ```javascript
   paymentUrl: "https://esewa.com.np/epay/main"
   verificationUrl: "https://esewa.com.np/api/epay/transaction/status/"
   ```

3. **Configure Callbacks**
   - Ensure success/failure URLs are publicly accessible
   - Use HTTPS for all callback URLs
   - Test callbacks from eSewa's production environment

4. **Security**
   - Store secret key in environment variables
   - Never commit credentials to version control
   - Use HTTPS for all API endpoints
   - Implement rate limiting on payment endpoints

5. **Monitoring**
   - Log all payment transactions
   - Set up alerts for failed payments
   - Monitor callback response times
   - Track payment success rates

## Support Resources

- **Full Documentation:** `ESEWA_OFFICIAL_INTEGRATION.md`
- **eSewa Developer Portal:** https://developer.esewa.com.np
- **eSewa Support:** merchant@esewa.com.np

## Quick Commands

```bash
# Backend
cd Eventish/backend && npm start

# Frontend Web
cd Eventish/frontend && npm run dev

# Mobile
cd Eventish/mobile && npx expo start

# Check backend logs
cd Eventish/backend && npm start | grep "eSewa"

# Test status check API
curl -X GET http://localhost:5000/api/esewa/status/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. Test complete payment flow
2. Verify all callbacks work
3. Test timeout scenario
4. Check booking status updates
5. Review logs for any errors
6. Test with real eSewa test account
7. Prepare for production deployment

---

**Last Updated:** Following official eSewa ePay documentation  
**Status:** ✅ Fully Implemented
