# eSewa Official Integration Guide

This document describes the complete eSewa payment integration following the official eSewa ePay documentation.

## Transaction Flow (Official eSewa Process)

### 1. Payment Initiation
When a user chooses eSewa as the payment option:
- User is temporarily redirected to eSewa ePay login page
- Mobile app uses WebView to display eSewa payment form

### 2. User Authentication
- User provides valid credentials on eSewa login page
- User confirms transaction details sent by merchant

### 3. Transaction Completion
- **Success**: User is redirected to merchant's success URL
- **Failure**: User is redirected to merchant's failure URL with appropriate message

### 4. Merchant Notification
- Merchant account is credited
- Notification sent via email/SMS

### 5. Status Verification (5-Minute Rule)
- If no response received within 5 minutes, use status check API
- Update payment status based on API response

## Implementation Details

### Backend Components

#### 1. eSewa Configuration (`backend/utils/esewaConfig.js`)

```javascript
export const esewaConfig = {
  paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  verificationUrl: "https://uat.esewa.com.np/api/epay/transaction/status/",
  merchantId: "EPAYTEST",
  secretKey: "8gBm/:&EnhH.1/q"
}
```

**Key Functions:**
- `generateEsewaSignature()` - Creates HMAC-SHA256 signature
- `generateEsewaFormData()` - Prepares payment form data
- `checkTransactionStatus()` - Verifies payment with eSewa API

#### 2. Payment Controller (`backend/controllers/esewaController.js`)

**Endpoints:**

1. **POST /api/esewa/initiate**
   - Initiates payment process
   - Generates transaction UUID
   - Creates payment form data with signature
   - Updates booking status to "Booked" (optimistic)
   - Returns payment URL and form data

2. **GET /api/esewa/success**
   - Handles eSewa success callback
   - Verifies payment with eSewa status check API
   - Updates booking payment status to "completed"
   - Redirects to frontend success page

3. **GET /api/esewa/failure**
   - Handles eSewa failure callback
   - Reverts booking status to "Scheduled"
   - Marks payment as "failed"
   - Redirects to frontend failure page

4. **GET /api/esewa/status/:bookingId**
   - Manual status check endpoint
   - Used when no response received within 5 minutes
   - Queries eSewa API for transaction status
   - Updates booking based on actual payment status

#### 3. Payment Verification Process

```javascript
// Success callback verification
const statusResponse = await checkTransactionStatus(
  productCode,
  transactionUuid,
  totalAmount
);

if (statusResponse.status === 'COMPLETE' || statusResponse.status === 'SUCCESS') {
  // Update booking as completed
} else if (statusResponse.status === 'PENDING') {
  // Mark for manual review
} else {
  // Mark as failed
}
```

### Mobile App Components

#### 1. Payment Initiation (`app/(tabs)/bookings.tsx`)

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
      formData: JSON.stringify(response.formData),
      bookingId: booking._id
    }
  });
};
```

#### 2. Payment WebView (`app/(customer)/esewa-payment.tsx`)

**Features:**
- Auto-submits payment form to eSewa
- Monitors navigation for success/failure redirects
- Implements 5-minute timeout
- Calls status check API if timeout occurs

**5-Minute Timeout Implementation:**
```typescript
React.useEffect(() => {
  const timeout = setTimeout(() => {
    if (!hasNavigated) {
      checkPaymentStatus(); // Call status check API
    }
  }, 300000); // 5 minutes

  return () => clearTimeout(timeout);
}, [hasNavigated]);
```

#### 3. Success Screen (`app/(customer)/esewa-success.tsx`)

**Handles:**
- Successful payment confirmation
- Pending verification status
- Navigation to bookings or home

#### 4. Failure Screen (`app/(customer)/esewa-failure.tsx`)

**Handles:**
- Payment cancellation
- Payment failure
- Retry options

## Payment Status Flow

```
┌─────────────────┐
│ User Initiates  │
│    Payment      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Backend Creates │
│ Transaction UUID│
│ & Form Data     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  WebView Opens  │
│  eSewa Login    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Success │ │Failure │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│Verify  │ │Revert  │
│with API│ │Booking │
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│Complete│ │Failed  │
└────────┘ └────────┘

If no response in 5 minutes:
         │
         ▼
┌─────────────────┐
│ Status Check API│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Complete│ │Pending │
└────────┘ └────────┘
```

## Security Features

### 1. Signature Generation
- Uses HMAC-SHA256 with secret key
- Prevents tampering with payment data
- Format: `total_amount={amount},transaction_uuid={uuid},product_code={code}`

### 2. Payment Verification
- Double verification on success callback
- Status check API for timeout scenarios
- Prevents duplicate payments

### 3. Authorization
- JWT token required for all payment endpoints
- User can only pay for their own bookings
- Booking ownership verified before payment

## Database Schema

### Booking Model Fields for eSewa

```javascript
{
  esewaTransactionUuid: String,  // Generated UUID for transaction
  esewaProductCode: String,       // Merchant ID
  esewaAmount: Number,            // Total amount with tax
  esewaTransactionId: String,     // eSewa reference ID
  esewaOrderId: String,           // Order ID from eSewa
  paymentStatus: String,          // pending, completed, failed, pending_verification
  paymentMethod: String,          // online, cash
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }]
}
```

## Testing

### Test Credentials (eSewa UAT)
- Merchant ID: `EPAYTEST`
- Secret Key: `8gBm/:&EnhH.1/q`
- Payment URL: `https://rc-epay.esewa.com.np/api/epay/main/v2/form`
- Verification URL: `https://uat.esewa.com.np/api/epay/transaction/status/`

### Test Scenarios

1. **Successful Payment**
   - Initiate payment
   - Complete eSewa login
   - Verify success callback
   - Check booking status updated

2. **Failed Payment**
   - Initiate payment
   - Cancel on eSewa page
   - Verify failure callback
   - Check booking reverted

3. **Timeout Scenario**
   - Initiate payment
   - Wait 5 minutes without completing
   - Verify status check API called
   - Check appropriate status update

4. **Network Failure**
   - Initiate payment
   - Simulate network disconnect
   - Use status check API manually
   - Verify correct status

## Production Checklist

- [ ] Update merchant credentials to production values
- [ ] Change payment URL to production endpoint
- [ ] Update verification URL to production endpoint
- [ ] Configure proper success/failure URLs
- [ ] Set up email notifications
- [ ] Implement proper error logging
- [ ] Add transaction monitoring
- [ ] Test with real eSewa account
- [ ] Verify webhook/callback URLs are accessible
- [ ] Set up SSL certificates for callback URLs

## Environment Variables

```env
# Backend .env
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:8081
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFICATION_URL=https://uat.esewa.com.np/api/epay/transaction/status/
```

## Troubleshooting

### Payment Not Completing
1. Check backend logs for callback reception
2. Verify callback URLs are accessible
3. Use status check API to verify payment
4. Check eSewa dashboard for transaction

### Signature Mismatch
1. Verify secret key is correct
2. Check signature generation format
3. Ensure amounts match exactly
4. Verify no extra spaces in signature string

### Timeout Issues
1. Check network connectivity
2. Verify eSewa API is accessible
3. Use status check API after 5 minutes
4. Check transaction in eSewa dashboard

## Support

For eSewa integration issues:
- eSewa Merchant Support: merchant@esewa.com.np
- eSewa Developer Docs: https://developer.esewa.com.np
- Technical Support: support@esewa.com.np
