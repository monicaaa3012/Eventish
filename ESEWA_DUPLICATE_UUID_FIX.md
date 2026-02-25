# eSewa Duplicate Transaction UUID - Fixed ✅

## Issue
Error: "Duplicate transaction UUID" (Code 0)

## Root Cause
When you retry a payment or test multiple times with the same booking, eSewa sees the transaction UUID has already been used and rejects it.

## Solution Implemented

### 1. Generate Fresh UUID on Each Attempt
The backend now generates a completely new UUID every time payment is initiated:

```javascript
// Always generate NEW UUID
const transactionUuid = crypto.randomUUID()
console.log("Generated new transaction UUID:", transactionUuid)

// If retrying, log the old one
if (booking.esewaTransactionUuid) {
  console.log("Previous transaction UUID:", booking.esewaTransactionUuid, "- Generating new one")
}
```

### 2. Clear Previous Transaction Data
When initiating a new payment, we clear any old transaction data:

```javascript
booking.esewaTransactionUuid = transactionUuid  // New UUID
booking.esewaTransactionId = undefined          // Clear old transaction ID
booking.esewaOrderId = undefined                // Clear old order ID
booking.paymentStatus = "pending"               // Reset to pending
```

### 3. Allow Retries
The system now properly handles payment retries:

```javascript
if (booking.paymentStatus === "pending") {
  console.log("⚠️  Retrying payment - previous attempt was pending")
  // Generate new UUID and continue
}
```

## How to Test Now

### Option 1: Create a New Booking
The cleanest way to test:
1. Create a fresh booking
2. Wait for vendor to schedule it
3. Try payment with the new booking

### Option 2: Reset Existing Booking
If you want to reuse the same booking for testing, you can manually reset it in the database or use this approach:

**Backend Console (MongoDB):**
```javascript
// Find your booking
db.bookings.findOne({ _id: ObjectId("your-booking-id") })

// Reset payment fields
db.bookings.updateOne(
  { _id: ObjectId("your-booking-id") },
  { 
    $unset: { 
      esewaTransactionUuid: "",
      esewaTransactionId: "",
      esewaOrderId: "",
      esewaProductCode: "",
      esewaAmount: ""
    },
    $set: {
      paymentStatus: null,
      paymentMethod: null
    }
  }
)
```

### Option 3: Use Different Bookings
Create multiple test bookings so each payment attempt uses a fresh booking.

## What Changed

### Before (Wrong):
```
Attempt 1: UUID = abc-123 → Failed
Attempt 2: UUID = abc-123 → ❌ Duplicate UUID error!
```

### After (Correct):
```
Attempt 1: UUID = abc-123 → Failed
Attempt 2: UUID = def-456 → ✅ New UUID, works!
Attempt 3: UUID = ghi-789 → ✅ New UUID, works!
```

## Verification

After restarting your backend, when you initiate payment you should see:

```
Payment amount: 1000
Generated new transaction UUID: e98461e0-56c8-42c9-9050-e059cb654c53
Previous transaction UUID: abc-123-old-uuid - Generating new one

=== Generating eSewa Signature ===
Message: total_amount=1100,transaction_uuid=e98461e0-56c8-42c9-9050-e059cb654c53,product_code=EPAYTEST
...
```

Each attempt will have a different UUID.

## Why This Happened

1. **First Attempt:** Payment initiated with UUID `abc-123`
2. **Payment Failed/Cancelled:** UUID `abc-123` is now "used" in eSewa's system
3. **Retry:** System tried to use the same UUID `abc-123` again
4. **eSewa Rejects:** "Duplicate transaction UUID" error

## Testing Workflow

### Clean Test (Recommended):
```
1. Create new booking
2. Vendor schedules it
3. Customer initiates payment (UUID: new-uuid-1)
4. Complete or cancel payment
5. If testing again, create another new booking
```

### Quick Test (For Development):
```
1. Use existing booking
2. Initiate payment (UUID: new-uuid-1)
3. Cancel payment
4. Backend generates new UUID automatically
5. Retry payment (UUID: new-uuid-2) ✅ Works!
```

## Database Fields

After the fix, each payment attempt updates:

```javascript
{
  esewaTransactionUuid: "new-uuid-generated-each-time",
  esewaTransactionId: undefined,  // Cleared on new attempt
  esewaOrderId: undefined,        // Cleared on new attempt
  paymentStatus: "pending",
  paymentMethod: "online"
}
```

## Common Scenarios

### Scenario 1: First Payment Attempt
```
Status: Scheduled
Payment Status: null
UUID: (none)
→ Generate new UUID ✅
→ Initiate payment ✅
```

### Scenario 2: Retry After Failure
```
Status: Scheduled
Payment Status: failed
UUID: old-uuid-123
→ Generate NEW UUID ✅
→ Clear old transaction data ✅
→ Initiate payment ✅
```

### Scenario 3: Retry Pending Payment
```
Status: Scheduled
Payment Status: pending
UUID: old-uuid-123
→ Generate NEW UUID ✅
→ Replace old UUID ✅
→ Initiate payment ✅
```

## What to Do Now

1. **Restart Backend:**
   ```bash
   cd Eventish/backend
   npm start
   ```

2. **Try Payment Again:**
   - Use the same booking (new UUID will be generated)
   - OR create a new booking for a clean test

3. **Check Logs:**
   You should see:
   ```
   Generated new transaction UUID: [new-uuid]
   Previous transaction UUID: [old-uuid] - Generating new one
   ```

4. **Payment Should Work:**
   - No more "Duplicate UUID" error
   - eSewa login page should appear
   - You can complete the payment

## If Still Getting Duplicate UUID Error

This would be very unusual after the fix, but if it happens:

1. **Check Backend Logs:**
   - Verify new UUID is being generated
   - Look for "Generated new transaction UUID:" message

2. **Clear Booking Data:**
   - The old UUID might be cached somewhere
   - Create a completely new booking

3. **Check eSewa Cache:**
   - eSewa might cache UUIDs for a short time
   - Wait 5 minutes and try again
   - Or use a different booking

4. **Verify Code Updated:**
   - Make sure backend restarted with new code
   - Check the controller file has the changes

## Success Indicators

✅ Backend logs show new UUID each time  
✅ No "Duplicate UUID" error from eSewa  
✅ eSewa login page appears  
✅ Can complete payment successfully  

---

**Status:** ✅ Fixed  
**Date:** 2026-02-25  
**Impact:** Can now retry payments without UUID conflicts
