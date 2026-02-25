# eSewa Integration - Implementation Checklist

## ✅ Pre-Installation Checklist

- [ ] Backend is running and accessible
- [ ] Backend has eSewa integration configured
- [ ] Mobile app is running successfully
- [ ] You have your local IP address
- [ ] You're on the same network (mobile device and computer)

## 📦 Installation Steps

### Step 1: Install Dependencies
- [ ] Navigate to `Eventish/mobile` directory
- [ ] Run installation script:
  - Windows: `INSTALL_ESEWA.bat`
  - Mac/Linux: `./INSTALL_ESEWA.sh`
  - Manual: `npx expo install react-native-webview`
- [ ] Verify installation completed successfully

### Step 2: Configure API
- [ ] Open `config/api.ts`
- [ ] Find your local IP address:
  - Windows: Run `ipconfig` in CMD
  - Mac/Linux: Run `ifconfig` or `ip addr`
- [ ] Update `SERVER_URL` with your IP:
  ```typescript
  const SERVER_URL = 'http://YOUR_LOCAL_IP:5000';
  ```
- [ ] Save the file

### Step 3: Verify Backend Configuration
- [ ] Open `../backend/.env`
- [ ] Verify these variables exist:
  ```env
  FRONTEND_URL=http://localhost:5173
  BACKEND_URL=http://localhost:5000
  ```
- [ ] Check eSewa configuration in `../backend/utils/esewaConfig.js`
- [ ] Verify test credentials are present

### Step 4: Start Services
- [ ] Start backend server:
  ```bash
  cd Eventish/backend
  npm start
  ```
- [ ] Verify backend is running on port 5000
- [ ] Start mobile app:
  ```bash
  cd Eventish/mobile
  npm start
  ```
- [ ] Scan QR code with Expo Go app

## 🧪 Testing Checklist

### Basic Flow Test
- [ ] Login as a customer
- [ ] Browse vendors
- [ ] Create a booking with a vendor
- [ ] Wait for vendor to accept (or login as vendor and accept)
- [ ] Wait for vendor to schedule (or login as vendor and schedule)
- [ ] Go to Bookings tab
- [ ] Verify "Confirm & Pay Advance" button appears
- [ ] Click the button

### Cash Payment Test
- [ ] Click "Confirm & Pay Advance"
- [ ] Select "Cash" from alert
- [ ] Verify booking status changes to "Booked"
- [ ] Verify payment status shows "Completed"
- [ ] Refresh bookings list
- [ ] Verify status persists

### eSewa Payment Test
- [ ] Click "Confirm & Pay Advance"
- [ ] Select "eSewa" from alert
- [ ] Verify "Processing" alert appears
- [ ] Verify WebView opens
- [ ] Verify loading indicator shows
- [ ] Verify eSewa payment form loads
- [ ] Complete payment on eSewa (use test credentials)
- [ ] Verify redirect to success screen
- [ ] Verify success message displays
- [ ] Click "Go to My Bookings"
- [ ] Verify booking status is "Booked"
- [ ] Verify payment status is "Completed"

### Payment Cancellation Test
- [ ] Start eSewa payment flow
- [ ] Click cancel button in WebView header
- [ ] Verify cancellation confirmation alert
- [ ] Confirm cancellation
- [ ] Verify return to bookings screen
- [ ] Verify booking status remains "Scheduled"

### Payment Failure Test
- [ ] Start eSewa payment flow
- [ ] Cancel payment on eSewa gateway
- [ ] Verify redirect to failure screen
- [ ] Verify failure message displays
- [ ] Click "Try Again"
- [ ] Verify return to bookings screen
- [ ] Verify booking status remains "Scheduled"

### Error Handling Test
- [ ] Turn off backend server
- [ ] Try to initiate eSewa payment
- [ ] Verify error alert appears
- [ ] Verify error message is clear
- [ ] Restart backend
- [ ] Retry payment
- [ ] Verify payment works

### Network Test
- [ ] Enable slow network simulation
- [ ] Start payment flow
- [ ] Verify loading indicators show
- [ ] Verify payment completes
- [ ] Disable network simulation

## 🔍 Verification Checklist

### Files Created
- [ ] `app/(customer)/esewa-payment.tsx` exists
- [ ] `app/(customer)/esewa-success.tsx` exists
- [ ] `app/(customer)/esewa-failure.tsx` exists
- [ ] `ESEWA_README.md` exists
- [ ] `ESEWA_INTEGRATION.md` exists
- [ ] `SETUP_ESEWA.md` exists
- [ ] `ESEWA_IMPLEMENTATION_SUMMARY.md` exists
- [ ] `ESEWA_UI_FLOW.md` exists
- [ ] `ESEWA_CHECKLIST.md` exists (this file)
- [ ] `INSTALL_ESEWA.sh` exists
- [ ] `INSTALL_ESEWA.bat` exists

### Files Modified
- [ ] `app/(tabs)/bookings.tsx` updated
- [ ] `config/api.ts` updated with ESEWA endpoints

### Code Quality
- [ ] No TypeScript errors (except WebView before installation)
- [ ] No console errors in app
- [ ] No console errors in backend
- [ ] All imports are correct
- [ ] All functions are properly typed

### UI/UX
- [ ] Payment button appears at correct time
- [ ] Alert shows correct options
- [ ] WebView loads properly
- [ ] Success screen looks good
- [ ] Failure screen looks good
- [ ] Navigation works smoothly
- [ ] Loading indicators are visible
- [ ] Error messages are clear

### Backend Integration
- [ ] Backend receives payment initiation request
- [ ] Backend generates correct form data
- [ ] Backend updates booking status
- [ ] Backend handles success callback
- [ ] Backend handles failure callback
- [ ] Backend logs are clear

## 📱 Device Testing

### iOS Testing
- [ ] Test on iPhone simulator
- [ ] Test on physical iPhone (if available)
- [ ] Verify WebView works
- [ ] Verify navigation works
- [ ] Verify payment completes

### Android Testing
- [ ] Test on Android emulator
- [ ] Test on physical Android device (if available)
- [ ] Verify WebView works
- [ ] Verify navigation works
- [ ] Verify payment completes

## 🚀 Production Readiness

### Configuration
- [ ] Update SERVER_URL to production backend
- [ ] Configure deep linking in app.json
- [ ] Set up production eSewa credentials
- [ ] Use production eSewa URL
- [ ] Enable HTTPS on backend
- [ ] Set up SSL certificates

### Security
- [ ] Verify HMAC signature generation
- [ ] Test payment verification
- [ ] Check transaction UUID uniqueness
- [ ] Verify secure communication
- [ ] Test error scenarios

### Performance
- [ ] Test with slow network
- [ ] Test with multiple concurrent payments
- [ ] Verify no memory leaks
- [ ] Check app performance
- [ ] Monitor backend performance

### Documentation
- [ ] Read all documentation files
- [ ] Understand payment flow
- [ ] Know how to troubleshoot
- [ ] Understand error handling
- [ ] Know production requirements

## 🐛 Troubleshooting Checklist

### WebView Issues
- [ ] Verify react-native-webview is installed
- [ ] Check WebView props are correct
- [ ] Verify JavaScript is enabled
- [ ] Check navigation state handler
- [ ] Review WebView logs

### Payment Issues
- [ ] Check backend is running
- [ ] Verify API endpoint is correct
- [ ] Check network connectivity
- [ ] Review backend logs
- [ ] Verify eSewa credentials

### Navigation Issues
- [ ] Check route names are correct
- [ ] Verify navigation params
- [ ] Check router imports
- [ ] Review navigation logs
- [ ] Test back button behavior

### Status Update Issues
- [ ] Verify booking ID is correct
- [ ] Check API call is successful
- [ ] Review backend response
- [ ] Check state updates
- [ ] Verify data refresh

## 📊 Metrics to Monitor

### Success Metrics
- [ ] Payment success rate
- [ ] Payment completion time
- [ ] User satisfaction
- [ ] Error rate
- [ ] Booking conversion rate

### Performance Metrics
- [ ] API response time
- [ ] WebView load time
- [ ] App responsiveness
- [ ] Backend performance
- [ ] Network latency

## ✨ Final Checks

- [ ] All tests pass
- [ ] No errors in console
- [ ] Documentation is complete
- [ ] Code is clean and commented
- [ ] Ready for production (if applicable)

## 🎉 Completion

Once all items are checked:
- [ ] Mark integration as complete
- [ ] Document any issues encountered
- [ ] Share with team
- [ ] Deploy to production (if ready)

---

**Congratulations!** 🎊

If all items are checked, your eSewa payment integration is complete and ready to use!

For support, refer to:
- `ESEWA_README.md` - Overview
- `SETUP_ESEWA.md` - Setup guide
- `ESEWA_INTEGRATION.md` - Technical docs
- `ESEWA_UI_FLOW.md` - UI guide
