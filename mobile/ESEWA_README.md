# eSewa Payment Integration for Mobile App

## 🎉 Overview

Successfully integrated eSewa payment gateway into the Eventish mobile app, allowing customers to pay for bookings using either Cash or eSewa online payment.

## 🚀 Quick Start

### Installation (Required)

**Windows:**
```bash
cd Eventish/mobile
INSTALL_ESEWA.bat
```

**Mac/Linux:**
```bash
cd Eventish/mobile
chmod +x INSTALL_ESEWA.sh
./INSTALL_ESEWA.sh
```

**Manual:**
```bash
cd Eventish/mobile
npx expo install react-native-webview
```

### Configuration

1. **Update Mobile API Config**
   
   Edit `config/api.ts`:
   ```typescript
   const SERVER_URL = 'http://YOUR_LOCAL_IP:5000';
   ```

2. **Verify Backend Config**
   
   Check `../backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:5000
   ```

3. **Start Everything**
   ```bash
   # Terminal 1 - Backend
   cd Eventish/backend
   npm start

   # Terminal 2 - Mobile
   cd Eventish/mobile
   npm start
   ```

## 📱 Features

### Payment Options
- ✅ **Cash Payment** - Immediate confirmation
- ✅ **eSewa Payment** - Secure online payment via WebView
- ✅ **Cancel Option** - User can cancel payment anytime

### User Experience
- Loading indicators during payment processing
- Full-screen WebView for eSewa payment
- Success screen with booking confirmation
- Failure screen with retry option
- Easy navigation to bookings or home

### Security
- HMAC-SHA256 signature verification
- Transaction UUID tracking
- Backend payment verification
- Secure HTTPS communication (production)

## 📂 New Files

### Payment Screens
```
app/(customer)/
├── esewa-payment.tsx    # WebView payment screen
├── esewa-success.tsx    # Success confirmation
└── esewa-failure.tsx    # Failure/cancellation
```

### Documentation
```
mobile/
├── ESEWA_README.md                    # This file
├── ESEWA_INTEGRATION.md               # Technical docs
├── SETUP_ESEWA.md                     # Setup guide
├── ESEWA_IMPLEMENTATION_SUMMARY.md    # Implementation details
├── INSTALL_ESEWA.sh                   # Linux/Mac installer
└── INSTALL_ESEWA.bat                  # Windows installer
```

## 🔄 Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Customer creates booking                                 │
│    Status: Pending                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Vendor accepts booking                                   │
│    Status: Accepted                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Vendor schedules service                                 │
│    Status: Scheduled                                        │
│    Button appears: "Confirm & Pay Advance"                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Customer clicks payment button                           │
│    Alert shows: Cash | eSewa | Cancel                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│   Cash Payment   │              │  eSewa Payment   │
└──────────────────┘              └──────────────────┘
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│ Immediate        │              │ WebView opens    │
│ Confirmation     │              │ with eSewa       │
│ Status: Booked   │              └──────────────────┘
└──────────────────┘                        ↓
                                  ┌──────────────────┐
                                  │ User completes   │
                                  │ payment on eSewa │
                                  └──────────────────┘
                                            ↓
                                  ┌──────────────────┐
                                  │ Backend verifies │
                                  │ payment          │
                                  └──────────────────┘
                                            ↓
                                  ┌──────────────────┐
                                  │ Success/Failure  │
                                  │ screen shown     │
                                  │ Status: Booked   │
                                  └──────────────────┘
```

## 🧪 Testing

### Test Environment
- **eSewa URL**: https://rc-epay.esewa.com.np/api/epay/main/v2/form
- **Merchant ID**: EPAYTEST
- **Environment**: Test/Sandbox

### Test Steps
1. ✅ Login as customer
2. ✅ Browse vendors and create booking
3. ✅ Wait for vendor to accept and schedule
4. ✅ Go to Bookings tab
5. ✅ Click "Confirm & Pay Advance"
6. ✅ Select "eSewa"
7. ✅ Complete payment in WebView
8. ✅ Verify success screen appears
9. ✅ Check booking status is "Booked"

### Test Scenarios
- ✅ Successful payment
- ✅ Failed payment
- ✅ Cancelled payment
- ✅ Network error handling
- ✅ Backend error handling

## 📊 Booking Status Flow

```
Pending → Accepted → Scheduled → Booked → In Progress → Completed
                         ↑
                    Payment here
                  (Cash or eSewa)
```

## 🔧 Technical Details

### API Endpoints
- `POST /api/esewa/initiate` - Initiate payment
- `GET /api/esewa/success` - Success callback
- `GET /api/esewa/failure` - Failure callback

### Payment Data Structure
```typescript
{
  amount: string,              // Base amount
  tax_amount: string,          // 10% tax
  total_amount: string,        // Base + tax
  transaction_uuid: string,    // Unique ID
  product_code: string,        // Merchant ID
  signature: string,           // HMAC-SHA256
  success_url: string,         // Backend callback
  failure_url: string,         // Backend callback
  // ... other fields
}
```

### WebView Implementation
- Auto-generates HTML form with payment data
- Auto-submits to eSewa gateway
- Monitors navigation for callback URLs
- Handles success/failure redirects

## 📖 Documentation

| File | Purpose |
|------|---------|
| `ESEWA_README.md` | Overview and quick start (this file) |
| `SETUP_ESEWA.md` | Step-by-step setup guide |
| `ESEWA_INTEGRATION.md` | Complete technical documentation |
| `ESEWA_IMPLEMENTATION_SUMMARY.md` | Implementation details |

## 🚨 Troubleshooting

### "Cannot find module 'react-native-webview'"
**Solution:** Run the installation script or manually install:
```bash
npx expo install react-native-webview
```

### "Cannot connect to server"
**Solution:** 
- Verify backend is running on port 5000
- Check mobile device is on same network
- Update SERVER_URL in config/api.ts with correct IP

### "Payment not completing"
**Solution:**
- Check backend console for errors
- Verify FRONTEND_URL and BACKEND_URL in backend .env
- Ensure eSewa test credentials are correct

### "WebView not loading"
**Solution:**
- Restart Expo development server
- Clear cache: `npx expo start -c`
- Verify JavaScript is enabled in WebView

## 🎯 Production Checklist

Before deploying to production:

- [ ] Install react-native-webview
- [ ] Update SERVER_URL with production backend URL
- [ ] Configure deep linking in app.json
- [ ] Use production eSewa URL
- [ ] Use production merchant credentials
- [ ] Enable HTTPS on backend
- [ ] Test payment flow end-to-end
- [ ] Test error scenarios
- [ ] Test on both iOS and Android
- [ ] Set up proper SSL certificates
- [ ] Configure production environment variables

## 🆘 Support

Need help? Check these resources:

1. **Quick Setup**: `SETUP_ESEWA.md`
2. **Technical Docs**: `ESEWA_INTEGRATION.md`
3. **Implementation**: `ESEWA_IMPLEMENTATION_SUMMARY.md`
4. **Backend Docs**: `../ESEWA_INTEGRATION.md`

## 📝 Notes

- Payment amount is calculated from booking's `servicePrice` field
- 10% tax is automatically added to base amount
- Transaction UUID is stored for verification
- Payment status is tracked separately from booking status
- Failed payments revert booking status to "Scheduled"
- Backend handles all payment verification

## ✨ What's Next?

After installation and testing:

1. Test the complete booking flow
2. Verify payment confirmation
3. Check booking status updates
4. Test error scenarios
5. Review logs for any issues
6. Prepare for production deployment

---

**Happy Coding! 🚀**

For questions or issues, refer to the documentation files or check the backend integration guide.
