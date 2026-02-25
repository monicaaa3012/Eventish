# eSewa Payment Integration - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Bookings Screen (bookings.tsx)              │  │
│  │                                                          │  │
│  │  - Display bookings list                                │  │
│  │  - Show "Confirm & Pay Advance" button                  │  │
│  │  - Handle payment method selection                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Payment Method Alert                           │  │
│  │                                                          │  │
│  │  [Cash]  [eSewa]  [Cancel]                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓                           ↓                         │
│  ┌─────────────────┐      ┌──────────────────────────────┐    │
│  │  Cash Payment   │      │  eSewa Payment Flow          │    │
│  │  - Immediate    │      │  - API call to backend       │    │
│  │  - No WebView   │      │  - Open WebView              │    │
│  └─────────────────┘      └──────────────────────────────┘    │
│                                      ↓                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        eSewa Payment Screen (esewa-payment.tsx)          │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │              WebView Component                     │ │  │
│  │  │                                                    │ │  │
│  │  │  - Generate HTML form                             │ │  │
│  │  │  - Auto-submit to eSewa                           │ │  │
│  │  │  - Monitor navigation                             │ │  │
│  │  │  - Detect success/failure URLs                    │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Success/Failure Screens                          │  │
│  │                                                          │  │
│  │  - esewa-success.tsx: Show confirmation                 │  │
│  │  - esewa-failure.tsx: Show error/cancellation           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    API Communication
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         POST /api/esewa/initiate                         │  │
│  │                                                          │  │
│  │  1. Receive booking ID                                  │  │
│  │  2. Validate booking                                    │  │
│  │  3. Calculate amount (base + 10% tax)                   │  │
│  │  4. Generate transaction UUID                           │  │
│  │  5. Generate HMAC-SHA256 signature                      │  │
│  │  6. Update booking status to "Booked" (optimistic)      │  │
│  │  7. Return payment URL + form data                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         GET /api/esewa/success                           │  │
│  │                                                          │  │
│  │  1. Receive eSewa callback (oid, amt, refId)            │  │
│  │  2. Find booking by transaction UUID                    │  │
│  │  3. Verify payment details                              │  │
│  │  4. Update payment status to "completed"                │  │
│  │  5. Store transaction ID                                │  │
│  │  6. Redirect to mobile success URL                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         GET /api/esewa/failure                           │  │
│  │                                                          │  │
│  │  1. Receive eSewa callback (pid)                        │  │
│  │  2. Find booking by transaction UUID                    │  │
│  │  3. Update payment status to "failed"                   │  │
│  │  4. Revert booking status to "Scheduled"                │  │
│  │  5. Redirect to mobile failure URL                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    Form Submission
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      ESEWA GATEWAY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  https://rc-epay.esewa.com.np/api/epay/main/v2/form            │
│                                                                 │
│  - Receive payment form data                                   │
│  - Verify signature                                            │
│  - Show payment interface to user                              │
│  - Process payment                                             │
│  - Redirect to success/failure URL                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────┐
│  Mobile  │
│   App    │
└────┬─────┘
     │
     │ 1. POST /api/esewa/initiate
     │    { bookingId: "..." }
     ↓
┌──────────┐
│ Backend  │
│   API    │
└────┬─────┘
     │
     │ 2. Generate payment data
     │    - UUID
     │    - Signature
     │    - Amount + Tax
     ↓
┌──────────┐
│  Mobile  │
│   App    │
└────┬─────┘
     │
     │ 3. Open WebView with form
     │    - paymentUrl
     │    - formData
     ↓
┌──────────┐
│  WebView │
│  (HTML)  │
└────┬─────┘
     │
     │ 4. Auto-submit form
     ↓
┌──────────┐
│  eSewa   │
│ Gateway  │
└────┬─────┘
     │
     │ 5. User completes payment
     ↓
┌──────────┐
│  eSewa   │
│ Gateway  │
└────┬─────┘
     │
     │ 6. Redirect to backend
     │    /api/esewa/success?oid=...&amt=...&refId=...
     ↓
┌──────────┐
│ Backend  │
│   API    │
└────┬─────┘
     │
     │ 7. Verify & update booking
     │    - payment_status = "completed"
     │    - booking_status = "Booked"
     ↓
┌──────────┐
│ Backend  │
│   API    │
└────┬─────┘
     │
     │ 8. Redirect to mobile
     │    ${FRONTEND_URL}/payment/esewa/success?...
     ↓
┌──────────┐
│  WebView │
│  (Detect)│
└────┬─────┘
     │
     │ 9. Navigate to success screen
     ↓
┌──────────┐
│  Mobile  │
│ Success  │
│  Screen  │
└──────────┘
```

## Component Hierarchy

```
App
└── (tabs)
    └── bookings.tsx
        ├── BookingCard
        │   └── PaymentButton
        │       └── PaymentAlert
        │           ├── Cash → confirmPayment()
        │           └── eSewa → initiateEsewaPayment()
        │                       └── Navigate to esewa-payment.tsx
        │
        └── (customer)
            ├── esewa-payment.tsx
            │   └── WebView
            │       ├── generatePaymentHTML()
            │       └── handleNavigationStateChange()
            │           ├── Success → esewa-success.tsx
            │           └── Failure → esewa-failure.tsx
            │
            ├── esewa-success.tsx
            │   ├── Success Icon
            │   ├── Success Message
            │   └── Navigation Buttons
            │
            └── esewa-failure.tsx
                ├── Failure Icon
                ├── Failure Message
                └── Navigation Buttons
```

## State Management

```
┌─────────────────────────────────────────┐
│         Booking State                   │
├─────────────────────────────────────────┤
│                                         │
│  status: string                         │
│    - "Pending"                          │
│    - "Accepted"                         │
│    - "Scheduled"  ← Payment available   │
│    - "Booked"     ← After payment       │
│    - "In Progress"                      │
│    - "Completed"                        │
│                                         │
│  paymentMethod: string                  │
│    - "cash"                             │
│    - "online" (eSewa)                   │
│                                         │
│  paymentStatus: string                  │
│    - "pending"                          │
│    - "completed"                        │
│    - "failed"                           │
│                                         │
│  esewaTransactionUuid: string           │
│  esewaTransactionId: string             │
│  esewaOrderId: string                   │
│  esewaAmount: number                    │
│                                         │
└─────────────────────────────────────────┘
```

## API Configuration

```typescript
// config/api.ts

const SERVER_URL = 'http://192.168.1.67:5000';
const BASE_URL = `${SERVER_URL}/api`;

export const API_CONFIG = {
  SERVER_URL,
  BASE_URL,
  ENDPOINTS: {
    BOOKINGS: {
      BASE: '/bookings',
      MY_BOOKINGS: '/bookings/my-bookings',
    },
    ESEWA: {
      INITIATE: '/esewa/initiate',
      SUCCESS: '/esewa/success',
      FAILURE: '/esewa/failure',
    }
  }
};
```

## Security Flow

```
┌─────────────────────────────────────────┐
│     1. Payment Initiation               │
│                                         │
│  Mobile → Backend                       │
│  - JWT token authentication             │
│  - Booking ID validation                │
│  - User authorization check             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     2. Signature Generation             │
│                                         │
│  Backend                                │
│  - Generate transaction UUID            │
│  - Create signature string              │
│  - HMAC-SHA256 with secret key          │
│  - Include in form data                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     3. Payment Processing               │
│                                         │
│  eSewa Gateway                          │
│  - Verify signature                     │
│  - Process payment                      │
│  - Generate reference ID                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     4. Payment Verification             │
│                                         │
│  Backend                                │
│  - Verify transaction UUID              │
│  - Verify amount                        │
│  - Update booking status                │
│  - Store transaction details            │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│         Error Scenarios                 │
├─────────────────────────────────────────┤
│                                         │
│  1. Network Error                       │
│     → Show error alert                  │
│     → Allow retry                       │
│                                         │
│  2. Backend Error                       │
│     → Show error message                │
│     → Log error details                 │
│     → Allow retry                       │
│                                         │
│  3. Payment Failure                     │
│     → Navigate to failure screen        │
│     → Revert booking status             │
│     → Allow retry                       │
│                                         │
│  4. User Cancellation                   │
│     → Close WebView                     │
│     → Return to bookings                │
│     → Keep booking in "Scheduled"       │
│                                         │
│  5. Timeout                             │
│     → Show timeout message              │
│     → Check payment status              │
│     → Allow retry                       │
│                                         │
└─────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────┐
│         Booking Model                   │
├─────────────────────────────────────────┤
│                                         │
│  _id: ObjectId                          │
│  customerId: ObjectId → User            │
│  vendorId: ObjectId → Vendor            │
│  serviceId: ObjectId → Service          │
│  eventId: ObjectId → Event              │
│  status: String                         │
│  paymentMethod: String                  │
│  paymentStatus: String                  │
│  servicePrice: Number                   │
│  scheduledDate: Date                    │
│  scheduledTime: String                  │
│  vendorConfirmed: Boolean               │
│                                         │
│  // eSewa specific fields               │
│  esewaTransactionUuid: String           │
│  esewaTransactionId: String             │
│  esewaOrderId: String                   │
│  esewaProductCode: String               │
│  esewaAmount: Number                    │
│                                         │
│  statusHistory: [{                      │
│    status: String,                      │
│    timestamp: Date,                     │
│    note: String                         │
│  }]                                     │
│                                         │
│  createdAt: Date                        │
│  updatedAt: Date                        │
│                                         │
└─────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│         Frontend (Mobile)               │
├─────────────────────────────────────────┤
│  - React Native                         │
│  - Expo                                 │
│  - Expo Router                          │
│  - react-native-webview                 │
│  - AsyncStorage                         │
│  - TypeScript                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Backend                         │
├─────────────────────────────────────────┤
│  - Node.js                              │
│  - Express.js                           │
│  - MongoDB                              │
│  - Mongoose                             │
│  - JWT Authentication                   │
│  - crypto (HMAC-SHA256)                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Payment Gateway                 │
├─────────────────────────────────────────┤
│  - eSewa API v2                         │
│  - Test Environment                     │
│  - HMAC-SHA256 Signature                │
└─────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Production Setup                │
├─────────────────────────────────────────┤
│                                         │
│  Mobile App (Expo)                      │
│  ├── Build for iOS                      │
│  ├── Build for Android                  │
│  └── Deploy to App Stores               │
│                                         │
│  Backend (Node.js)                      │
│  ├── Deploy to cloud (AWS/Heroku)       │
│  ├── Enable HTTPS                       │
│  ├── Set environment variables          │
│  └── Configure production eSewa         │
│                                         │
│  Database (MongoDB)                     │
│  ├── MongoDB Atlas                      │
│  ├── Backup strategy                    │
│  └── Monitoring                         │
│                                         │
└─────────────────────────────────────────┘
```

---

This architecture document provides a comprehensive overview of the eSewa payment integration system.
