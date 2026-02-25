# eSewa Integration - Quick Reference Card

## 🚀 Installation (One Command)

```bash
cd Eventish/mobile && npx expo install react-native-webview
```

## ⚙️ Configuration (One File)

**File:** `config/api.ts`
```typescript
const SERVER_URL = 'http://YOUR_LOCAL_IP:5000';
```

## 📂 New Files (3 Screens)

```
app/(customer)/
├── esewa-payment.tsx    # WebView payment
├── esewa-success.tsx    # Success screen
└── esewa-failure.tsx    # Failure screen
```

## 🔄 Payment Flow (Simple)

```
Scheduled → Click Button → Choose eSewa → WebView → Success → Booked
```

## 💻 Key Code Snippets

### Initiate Payment
```typescript
const initiateEsewaPayment = async (booking: Booking) => {
  const response = await apiCall('/esewa/initiate', {
    method: 'POST',
    body: JSON.stringify({ bookingId: booking._id })
  });
  
  router.push({
    pathname: '/(customer)/esewa-payment',
    params: {
      paymentUrl: response.paymentUrl,
      formData: JSON.stringify(response.formData)
    }
  });
};
```

### WebView Payment
```typescript
<WebView
  source={{ html: generatePaymentHTML() }}
  onNavigationStateChange={handleNavigationStateChange}
/>
```

### Handle Success
```typescript
if (url.includes('/esewa/success')) {
  router.replace({
    pathname: '/(customer)/esewa-success',
    params: { oid, amt, refId }
  });
}
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/esewa/initiate` | Start payment |
| GET | `/api/esewa/success` | Success callback |
| GET | `/api/esewa/failure` | Failure callback |

## 📊 Status Flow

```
Pending → Accepted → Scheduled → [PAYMENT] → Booked → In Progress → Completed
```

## 🧪 Test Commands

```bash
# Start backend
cd Eventish/backend && npm start

# Start mobile
cd Eventish/mobile && npm start
```

## 🎨 UI Components

### Payment Button
```typescript
<TouchableOpacity onPress={() => handlePayment(item)}>
  <Text>Confirm & Pay Advance</Text>
</TouchableOpacity>
```

### Payment Alert
```typescript
Alert.alert("Payment Method", "Choose your advance payment method", [
  { text: "Cash", onPress: () => confirmPayment(id, 'cash') },
  { text: "eSewa", onPress: () => initiateEsewaPayment(booking) },
  { text: "Cancel", style: "cancel" }
]);
```

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| WebView not found | `npx expo install react-native-webview` |
| Cannot connect | Update SERVER_URL in config/api.ts |
| Payment not completing | Check backend logs |
| Status not updating | Refresh bookings list |

## 📱 Testing Checklist

- [ ] Install WebView
- [ ] Update SERVER_URL
- [ ] Start backend
- [ ] Start mobile app
- [ ] Create booking
- [ ] Schedule booking
- [ ] Test cash payment
- [ ] Test eSewa payment
- [ ] Verify status updates

## 🔐 eSewa Test Config

```javascript
URL: https://rc-epay.esewa.com.np/api/epay/main/v2/form
Merchant: EPAYTEST
Environment: Test/Sandbox
```

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `ESEWA_README.md` | Main overview |
| `SETUP_ESEWA.md` | Setup guide |
| `ESEWA_INTEGRATION.md` | Technical docs |
| `ESEWA_CHECKLIST.md` | Testing checklist |
| `ESEWA_UI_FLOW.md` | UI guide |

## 🎯 Key Features

✅ Cash payment
✅ eSewa payment
✅ WebView integration
✅ Success/failure screens
✅ Status tracking
✅ Error handling

## 💡 Pro Tips

1. **Always test on real device** for accurate WebView behavior
2. **Check backend logs** for payment verification details
3. **Use test credentials** in development
4. **Verify network connectivity** before testing
5. **Clear app cache** if issues persist

## 🚨 Emergency Commands

```bash
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules && npm install

# Reset Expo
npx expo start --clear
```

## 📞 Support

- Check `ESEWA_README.md` for overview
- Check `ESEWA_INTEGRATION.md` for technical details
- Check `ESEWA_CHECKLIST.md` for testing
- Check backend logs for errors

## 🎉 Success Indicators

✅ WebView loads eSewa
✅ Payment completes
✅ Success screen shows
✅ Booking status = "Booked"
✅ Payment status = "Completed"

---

**Keep this card handy for quick reference!** 📌
