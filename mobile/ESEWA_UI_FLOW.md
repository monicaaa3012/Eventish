# eSewa Payment - UI Flow Guide

## Visual Flow of Payment Process

### 1. Bookings Screen (Scheduled Status)

```
┌─────────────────────────────────────────┐
│  📱 My Bookings                    🔄   │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Vendor Name              Scheduled│ │
│  │ Event: Birthday Party             │ │
│  │ 📅 2024-03-15                     │ │
│  │ 📍 Kathmandu                      │ │
│  │                                   │ │
│  │ Scheduled for:                    │ │
│  │ 2024-03-15 at 10:00 AM           │ │
│  │                                   │ │
│  │ ┌───────────────────────────────┐│ │
│  │ │ Confirm & Pay Advance         ││ │  ← Click here
│  │ └───────────────────────────────┘│ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Payment Method Selection

```
┌─────────────────────────────────────────┐
│                                         │
│         Payment Method                  │
│                                         │
│  Choose your advance payment method     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │           💵 Cash                 │ │  ← Immediate confirmation
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │           💳 eSewa                │ │  ← Opens WebView
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │           ❌ Cancel               │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 3. eSewa Payment WebView

```
┌─────────────────────────────────────────┐
│  ❌  eSewa Payment                      │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │   Redirecting to eSewa...         │ │
│  │                                   │ │
│  │         ⭕ Loading...              │ │
│  │                                   │ │
│  │   Please wait while we process    │ │
│  │   your payment                    │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [eSewa payment form loads here]        │
│                                         │
│  - Amount: Rs. 1100                     │
│  - Tax: Rs. 100                         │
│  - Total: Rs. 1100                      │
│                                         │
│  [User completes payment on eSewa]      │
│                                         │
└─────────────────────────────────────────┘
```

### 4a. Success Screen

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         ┌─────────────────┐            │
│         │                 │            │
│         │    ✅ ✓         │            │
│         │                 │            │
│         └─────────────────┘            │
│                                         │
│      Payment Successful!                │
│                                         │
│  Payment successful! Your booking       │
│  has been confirmed.                    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Go to My Bookings              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Go to Home                     │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 4b. Failure Screen

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         ┌─────────────────┐            │
│         │                 │            │
│         │    ❌ ✗         │            │
│         │                 │            │
│         └─────────────────┘            │
│                                         │
│      Payment Cancelled                  │
│                                         │
│  Your payment was cancelled or          │
│  failed. You can try again or           │
│  choose a different payment method.     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Try Again                      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    Go to Home                     │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 5. Updated Booking (After Success)

```
┌─────────────────────────────────────────┐
│  📱 My Bookings                    🔄   │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Vendor Name                 Booked│ │  ← Status changed!
│  │ Event: Birthday Party             │ │
│  │ 📅 2024-03-15                     │ │
│  │ 📍 Kathmandu                      │ │
│  │                                   │ │
│  │ Scheduled for:                    │ │
│  │ 2024-03-15 at 10:00 AM           │ │
│  │                                   │ │
│  │ Payment: eSewa (Completed) ✅     │ │  ← Payment confirmed
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## User Interactions

### Cash Payment Flow
```
Bookings Screen
    ↓ (Click "Confirm & Pay Advance")
Payment Method Alert
    ↓ (Select "Cash")
✅ Immediate Confirmation
    ↓
Booking Status → "Booked"
Payment Status → "Completed"
```

### eSewa Payment Flow
```
Bookings Screen
    ↓ (Click "Confirm & Pay Advance")
Payment Method Alert
    ↓ (Select "eSewa")
Processing Alert
    ↓
WebView Payment Screen
    ↓ (Auto-submit form)
eSewa Payment Gateway
    ↓ (User completes payment)
Backend Verification
    ↓
Success/Failure Screen
    ↓
Booking Status → "Booked"
Payment Status → "Completed"
```

## Screen Components

### Bookings Screen (`app/(tabs)/bookings.tsx`)
**Key Elements:**
- Booking cards with status badges
- "Confirm & Pay Advance" button (visible when status = "Scheduled")
- Payment method selection alert
- Refresh button

**Actions:**
- `handlePayment(booking)` - Shows payment method alert
- `confirmPayment(id, 'cash')` - Confirms cash payment
- `initiateEsewaPayment(booking)` - Starts eSewa payment

### Payment WebView (`app/(customer)/esewa-payment.tsx`)
**Key Elements:**
- Header with cancel button
- WebView with auto-submitting form
- Loading indicator
- Navigation state monitoring

**Actions:**
- Auto-generates HTML form
- Auto-submits to eSewa
- Monitors for success/failure URLs
- Navigates to result screen

### Success Screen (`app/(customer)/esewa-success.tsx`)
**Key Elements:**
- Success icon (green checkmark)
- Success message
- "Go to My Bookings" button
- "Go to Home" button

**Actions:**
- Displays payment confirmation
- Navigates to bookings or home

### Failure Screen (`app/(customer)/esewa-failure.tsx`)
**Key Elements:**
- Failure icon (red X)
- Failure message
- "Try Again" button
- "Go to Home" button

**Actions:**
- Displays cancellation message
- Allows retry or return home

## Status Indicators

### Booking Status Colors
```
Pending      → 🟡 Orange  (#F59E0B)
Accepted     → 🟢 Green   (#10B981)
Scheduled    → 🔵 Blue    (#3B82F6)
Booked       → 🟣 Indigo  (#6366F1)
In Progress  → 🟣 Purple  (#4F46E5)
Completed    → 🟢 Green   (#059669)
Rejected     → 🔴 Red     (#EF4444)
```

### Payment Status Indicators
```
Pending      → ⏳ Hourglass
Completed    → ✅ Checkmark
Failed       → ❌ Cross
```

## Button States

### "Confirm & Pay Advance" Button
```
Visible when:  status === "Scheduled"
Color:         Blue (#3B82F6)
Action:        Shows payment method alert
```

### Payment Method Buttons
```
Cash:
  - Immediate confirmation
  - No additional screens
  
eSewa:
  - Opens WebView
  - Shows payment gateway
  - Redirects to success/failure
  
Cancel:
  - Dismisses alert
  - No action taken
```

## Loading States

### 1. Initial Payment Processing
```
Alert: "Processing"
Message: "Initiating eSewa payment..."
```

### 2. WebView Loading
```
Spinner + Text: "Loading payment gateway..."
```

### 3. Payment Verification
```
Spinner + Text: "Verifying your payment..."
```

## Error Handling

### Network Error
```
Alert: "Error"
Message: "Failed to initiate payment"
Action: User can retry
```

### Payment Failure
```
Screen: Failure Screen
Message: "Payment was cancelled or failed"
Action: Try again or go home
```

### Backend Error
```
Alert: "Error"
Message: "Payment confirmation failed"
Action: Contact support
```

## Navigation Flow

```
Bookings Tab
    ↓
Payment Method Alert
    ↓
eSewa Payment WebView
    ↓
Success/Failure Screen
    ↓
Back to Bookings Tab or Home
```

## Tips for Users

1. **Ensure stable internet connection** before starting payment
2. **Don't close the app** during payment process
3. **Wait for confirmation** before leaving the screen
4. **Check booking status** after payment
5. **Contact vendor** if payment succeeds but status doesn't update

## Developer Notes

### Customization Points
- Colors in StyleSheet objects
- Button text and labels
- Alert messages
- Loading indicators
- Success/failure messages

### Testing UI
1. Test on different screen sizes
2. Test with slow network
3. Test payment cancellation
4. Test success flow
5. Test failure flow
6. Test navigation back button

---

This UI flow guide helps understand the visual journey of the eSewa payment integration.
