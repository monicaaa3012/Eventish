# eSewa Integration - Next Steps

## Current Status

✅ **Signature Generation** - Working correctly (verified with eSewa test case)  
✅ **Form Data Generation** - All required fields present  
✅ **Payment Status Fix** - Booking status now handled correctly  
✅ **Debugging Added** - Console logs and error handling in place  
⏳ **Testing Needed** - Need to verify actual payment flow  

## What to Check Now

### 1. Run the Backend and Check Logs

```bash
cd Eventish/backend
npm start
```

When you initiate a payment, you should see detailed logs:

```
=== Generating eSewa Signature ===
Message: total_amount=1100,transaction_uuid=...,product_code=EPAYTEST
Secret Key: 8gBm/:&EnhH.1/q
Generated Signature: ...
==================================

=== Generating eSewa Form Data ===
Amount: 1000
Tax Amount: 100
Total Amount: 1100
Transaction UUID: ...
Product Code: EPAYTEST
Success URL: http://...
Failure URL: http://...
Generated Form Data: {...}
===================================
```

### 2. Check Mobile App Console

In your Expo console, look for:

```
=== eSewa Payment Form Data ===
Payment URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Form Data: {...}
==============================
```

### 3. What Happens After "Processing"?

The "Redirecting to eSewa..." screen should:
1. Show for 1 second
2. Auto-submit the form
3. Navigate to eSewa login page

**If stuck on "Processing":**
- Check if eSewa UAT environment is accessible
- Look for error messages in console
- Try the browser test (see below)

## Quick Tests

### Test 1: Verify Signature Generation

```bash
cd Eventish/backend
node testEsewaSignature.js
```

Expected output:
```
Test Case 1: eSewa Example
Match: ✅ YES
```

### Test 2: Browser Test (Verify eSewa is Working)

Create `test-esewa.html`:

```html
<!DOCTYPE html>
<html>
<body>
  <h2>eSewa Test Payment</h2>
  <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
    <input type="hidden" name="amount" value="100">
    <input type="hidden" name="tax_amount" value="10">
    <input type="hidden" name="total_amount" value="110">
    <input type="hidden" name="transaction_uuid" value="test-241028">
    <input type="hidden" name="product_code" value="EPAYTEST">
    <input type="hidden" name="product_service_charge" value="0">
    <input type="hidden" name="product_delivery_charge" value="0">
    <input type="hidden" name="success_url" value="https://developer.esewa.com.np/success">
    <input type="hidden" name="failure_url" value="https://developer.esewa.com.np/failure">
    <input type="hidden" name="signed_field_names" value="total_amount,transaction_uuid,product_code">
    <input type="hidden" name="signature" value="i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=">
    <button type="submit">Test eSewa Payment</button>
  </form>
  <p>This uses eSewa's official test values. Click to verify eSewa is working.</p>
</body>
</html>
```

Open in browser and click "Test eSewa Payment". If this works, eSewa is fine and the issue is with the mobile WebView.

### Test 3: Check eSewa Accessibility

```bash
curl -I https://rc-epay.esewa.com.np/api/epay/main/v2/form
```

Should return HTTP 200 or 405 (Method Not Allowed is OK for GET request).

## Common Issues & Solutions

### Issue 1: "Processing" Stuck Forever

**Possible Causes:**
- eSewa UAT environment is slow/down
- WebView not loading eSewa page
- Network connectivity issues

**Solutions:**
1. Wait 30 seconds and see if it loads
2. Check backend and mobile console logs
3. Try browser test to verify eSewa is working
4. Check internet connection
5. Try during Nepal business hours (eSewa UAT might be offline)

### Issue 2: Callback URLs Not Working

**Problem:** Your backend is on `localhost` or local IP, eSewa can't reach it.

**Solution:** Use ngrok for testing:

```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 5000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update backend/.env
BACKEND_URL=https://abc123.ngrok.io
FRONTEND_URL=https://abc123.ngrok.io

# Restart backend
```

**Alternative:** Use eSewa developer URLs temporarily:

```javascript
// In esewaController.js, replace:
const successUrl = `${backendUrl}/api/esewa/success`
const failureUrl = `${backendUrl}/api/esewa/failure`

// With:
const successUrl = "https://developer.esewa.com.np/success"
const failureUrl = "https://developer.esewa.com.np/failure"
```

Then manually check payment status using the status check API.

### Issue 3: WebView Errors

Check mobile console for errors like:
- `WebView error: ...`
- `HTTP error: 404` or `HTTP error: 500`

These indicate the WebView couldn't load the page.

## Testing Workflow

### Step 1: Start Backend
```bash
cd Eventish/backend
npm start
```

### Step 2: Start Mobile App
```bash
cd Eventish/mobile
npx expo start
```

### Step 3: Create a Test Booking
1. Login as customer
2. Browse vendors
3. Create a booking
4. Wait for vendor to schedule it

### Step 4: Initiate Payment
1. Go to Bookings tab
2. Find "Scheduled" booking
3. Click "Confirm & Pay Advance"
4. Select "eSewa"

### Step 5: Watch the Logs

**Backend Console:**
```
=== Generating eSewa Signature ===
...
=== Generating eSewa Form Data ===
...
```

**Mobile Console:**
```
=== eSewa Payment Form Data ===
...
WebView navigation: https://rc-epay.esewa.com.np/...
```

### Step 6: Complete Payment

If eSewa login page appears:
1. Login with test credentials (provided by eSewa)
2. Confirm payment
3. Should redirect to success page

If stuck on "Processing":
1. Check console logs for errors
2. Try browser test
3. Verify eSewa UAT is accessible
4. Check network connection

## What Should Happen

### Successful Flow:
```
1. User clicks "Pay with eSewa"
   ↓
2. Backend generates signature
   ↓
3. Mobile receives payment URL + form data
   ↓
4. WebView loads HTML with form
   ↓
5. Form auto-submits after 1 second
   ↓
6. eSewa login page appears
   ↓
7. User logs in and confirms
   ↓
8. eSewa redirects to success URL
   ↓
9. Backend verifies payment
   ↓
10. User sees success screen
```

### If Stuck at Step 5-6:
- eSewa UAT might be down
- Network issues
- WebView not loading properly

## Debugging Commands

```bash
# Check backend is running
curl http://localhost:5000/api/bookings/customer

# Check eSewa is accessible
curl -I https://rc-epay.esewa.com.np/api/epay/main/v2/form

# Test signature generation
cd Eventish/backend && node testEsewaSignature.js

# Check mobile device can reach backend
# (Replace with your IP)
curl http://192.168.1.67:5000/api/bookings/customer
```

## Files to Check

1. **Backend Logs** - `Eventish/backend` console
2. **Mobile Logs** - Expo console
3. **WebView Logs** - Look for "WebView navigation:" messages
4. **Network Tab** - If using browser, check network requests

## Documentation Files

- `ESEWA_OFFICIAL_INTEGRATION.md` - Complete technical docs
- `ESEWA_QUICK_START.md` - Quick reference
- `ESEWA_PAYMENT_STATUS_FIX.md` - Status handling fix
- `ESEWA_PROCESSING_STUCK_FIX.md` - Troubleshooting stuck processing
- `ESEWA_INTEGRATION_COMPLETE.md` - Implementation summary

## Need Help?

1. **Check Logs First** - Most issues show up in console logs
2. **Try Browser Test** - Verify eSewa is working
3. **Use ngrok** - If callback URLs are the issue
4. **Check eSewa Status** - UAT environment might be down
5. **Contact eSewa** - merchant@esewa.com.np

## Expected Test Credentials

eSewa should provide test credentials for UAT environment:
- Test User ID
- Test Password
- Test Account with balance

Contact eSewa support if you don't have these.

---

**Next Action:** Run the backend, initiate a payment, and check the console logs to see where it's getting stuck.
