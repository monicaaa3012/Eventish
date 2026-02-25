# eSewa "Processing" Stuck Issue - Troubleshooting Guide

## Issue
After login, the payment page shows "processing" or "Redirecting to eSewa..." but nothing happens.

## Verified Working
✅ Signature generation is correct (matches eSewa's test case)  
✅ Form data format is correct  
✅ All required fields are present  

## Possible Causes & Solutions

### 1. eSewa Test Environment Issues

**Problem:** eSewa's UAT (test) environment might be slow or temporarily down.

**Solution:**
- Wait a few minutes and try again
- Check eSewa's status page
- Try during business hours (Nepal time)

**Test:**
```bash
# Check if eSewa test URL is accessible
curl -I https://rc-epay.esewa.com.np/api/epay/main/v2/form
```

### 2. WebView Not Loading eSewa Page

**Problem:** The WebView might not be properly loading the eSewa login page.

**Solution:** Add error handling and console logging

Check the mobile app console for:
```
=== eSewa Payment Form Data ===
Payment URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Form Data: { amount: "1000", tax_amount: "100", ... }
```

### 3. Network/CORS Issues

**Problem:** Mobile device can't reach eSewa servers.

**Solution:**
- Ensure device has internet connection
- Try on different network (WiFi vs mobile data)
- Check if eSewa URL is blocked by firewall

### 4. Callback URLs Not Accessible

**Problem:** eSewa can't reach your success/failure URLs.

**Current URLs:**
```javascript
successUrl: `${backendUrl}/api/esewa/success`
failureUrl: `${backendUrl}/api/esewa/failure`
```

**Issue:** If `backendUrl` is `localhost` or local IP, eSewa servers can't reach it!

**Solution for Testing:**
Use ngrok or similar service to expose your backend:

```bash
# Install ngrok
npm install -g ngrok

# Expose backend
ngrok http 5000

# Update .env with ngrok URL
BACKEND_URL=https://your-ngrok-url.ngrok.io
```

### 5. Form Submission Timing

**Problem:** Form submits too quickly before WebView is ready.

**Current:** 1 second delay
```javascript
setTimeout(() => {
  document.getElementById('esewaForm').submit();
}, 1000);
```

**Solution:** Increase delay or wait for page load
```javascript
setTimeout(() => {
  document.getElementById('esewaForm').submit();
}, 2000); // Try 2 seconds
```

## Debugging Steps

### Step 1: Check Backend Logs

When you initiate payment, you should see:
```
=== Generating eSewa Signature ===
Message: total_amount=1100,transaction_uuid=...,product_code=EPAYTEST
Generated Signature: ...
===================================

=== Generating eSewa Form Data ===
Amount: 1000
Tax Amount: 100
Total Amount: 1100
...
```

### Step 2: Check Mobile Console

In Expo/React Native console, look for:
```
=== eSewa Payment Form Data ===
Payment URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Form Data: {...}
```

### Step 3: Check WebView Console

The WebView should log:
```
=== eSewa Form Submission ===
Action URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Form Data: {...}
Submitting form to eSewa...
```

### Step 4: Test with Browser

Create a test HTML file to verify eSewa is working:

```html
<!DOCTYPE html>
<html>
<body>
  <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
    <input type="text" name="amount" value="100">
    <input type="text" name="tax_amount" value="10">
    <input type="text" name="total_amount" value="110">
    <input type="text" name="transaction_uuid" value="test-123">
    <input type="text" name="product_code" value="EPAYTEST">
    <input type="text" name="product_service_charge" value="0">
    <input type="text" name="product_delivery_charge" value="0">
    <input type="text" name="success_url" value="https://developer.esewa.com.np/success">
    <input type="text" name="failure_url" value="https://developer.esewa.com.np/failure">
    <input type="text" name="signed_field_names" value="total_amount,transaction_uuid,product_code">
    <input type="text" name="signature" value="i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=">
    <input type="submit" value="Test eSewa">
  </form>
</body>
</html>
```

Save as `test-esewa.html` and open in browser. If this works, the issue is with the mobile WebView.

## Quick Fixes to Try

### Fix 1: Use Developer URLs for Testing

Update backend controller to use eSewa's developer URLs:

```javascript
const successUrl = "https://developer.esewa.com.np/success"
const failureUrl = "https://developer.esewa.com.np/failure"
```

This way eSewa can reach the URLs even if your backend is local.

**Note:** You won't get the callback, but you can manually check payment status.

### Fix 2: Add WebView Error Handling

```typescript
<WebView
  source={{ html: generatePaymentHTML() }}
  onError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    Alert.alert('Error', 'Failed to load payment page');
  }}
  onHttpError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('HTTP error:', nativeEvent.statusCode);
  }}
/>
```

### Fix 3: Enable JavaScript Debugging

```typescript
<WebView
  source={{ html: generatePaymentHTML() }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  onMessage={(event) => {
    console.log('WebView message:', event.nativeEvent.data);
  }}
  onConsoleMessage={(event) => {
    console.log('WebView console:', event.nativeEvent.message);
  }}
/>
```

### Fix 4: Test with Simpler HTML

Try a minimal HTML to see if WebView works:

```typescript
const testHTML = `
  <!DOCTYPE html>
  <html>
  <body>
    <h1>Test Page</h1>
    <p>If you see this, WebView is working</p>
    <form id="testForm" action="${paymentUrl}" method="POST">
      <input type="submit" value="Click to Submit">
    </form>
  </body>
  </html>
`;
```

## Common Solutions

### Solution 1: Use ngrok for Local Testing

```bash
# Terminal 1: Start backend
cd Eventish/backend
npm start

# Terminal 2: Expose with ngrok
ngrok http 5000

# Update backend .env
BACKEND_URL=https://abc123.ngrok.io
FRONTEND_URL=https://abc123.ngrok.io

# Restart backend
```

### Solution 2: Use eSewa Developer URLs

For testing, use eSewa's developer URLs so you don't need ngrok:

```javascript
// In esewaController.js
const successUrl = "https://developer.esewa.com.np/success"
const failureUrl = "https://developer.esewa.com.np/failure"
```

Then manually check payment status using the status check API.

### Solution 3: Add Timeout and Manual Check

If form doesn't submit after 10 seconds, show manual check option:

```typescript
setTimeout(() => {
  Alert.alert(
    'Payment Taking Long?',
    'The payment page is taking longer than expected. Would you like to check payment status?',
    [
      { text: 'Check Status', onPress: () => checkPaymentStatus() },
      { text: 'Wait', style: 'cancel' }
    ]
  );
}, 10000);
```

## Testing Checklist

- [ ] Backend server is running
- [ ] Mobile device can reach backend
- [ ] eSewa test environment is accessible
- [ ] Signature is generated correctly
- [ ] Form data includes all required fields
- [ ] WebView loads HTML successfully
- [ ] Form submits to eSewa
- [ ] eSewa login page appears
- [ ] Can complete test payment
- [ ] Callback URLs are accessible (or using developer URLs)

## Expected Flow

1. User clicks "Pay with eSewa"
2. Backend generates signature and form data
3. Mobile app receives payment URL and form data
4. WebView loads HTML with form
5. Form auto-submits to eSewa (after 1 second)
6. eSewa login page appears
7. User logs in with test credentials
8. User confirms payment
9. eSewa redirects to success/failure URL
10. App detects redirect and shows result

## If Still Stuck

1. **Check eSewa Status**
   - Visit https://esewa.com.np
   - Check if service is available
   - Try during Nepal business hours

2. **Use Browser Test**
   - Create test HTML file
   - Submit directly from browser
   - Verify eSewa is working

3. **Contact eSewa Support**
   - Email: merchant@esewa.com.np
   - Provide transaction UUID
   - Ask about UAT environment status

4. **Use Developer URLs**
   - Temporarily use eSewa's developer URLs
   - Test payment flow
   - Manually verify with status check API

## Next Steps

1. Add the debugging logs
2. Test with browser HTML file
3. Try with ngrok if callback URLs are the issue
4. Check eSewa UAT environment status
5. Consider using developer URLs for testing

---

**Status:** Troubleshooting in progress  
**Last Updated:** 2026-02-25
