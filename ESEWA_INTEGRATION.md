# eSewa Payment Integration

## Overview
This project integrates eSewa payment gateway for booking confirmations using the proper form-based submission method. When customers want to confirm a vendor booking, they can choose between cash payment or online payment via eSewa.

## Flow
1. Customer makes a booking request
2. Vendor accepts and schedules the service
3. Customer sees "Book Vendor" button
4. Customer chooses payment method: Cash or eSewa
5. For eSewa: Form is automatically submitted to eSewa with proper payload
6. After payment: Customer is redirected back with success/failure
7. Booking status changes to "Booked"

## Configuration

### Backend (.env)
```
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

### eSewa Configuration
- **Payment URL**: https://rc-epay.esewa.com.np/api/epay/main/v2/form
- **Merchant ID**: EPAYTEST
- **Secret Key**: 8gBm/:&EnhH.1/q

## API Endpoints

### POST /api/esewa/initiate
Initiates eSewa payment for a booking.

**Request:**
```json
{
  "bookingId": "booking_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  "formData": {
    "amount": "1000",
    "failure_url": "http://localhost:5000/api/esewa/failure",
    "product_delivery_charge": "0",
    "product_service_charge": "0",
    "product_code": "EPAYTEST",
    "signature": "generated_signature",
    "signed_field_names": "total_amount,transaction_uuid,product_code",
    "success_url": "http://localhost:5000/api/esewa/success",
    "tax_amount": "100",
    "total_amount": "1100",
    "transaction_uuid": "unique_uuid"
  }
}
```

### GET /api/esewa/success
eSewa success callback - automatically updates booking status to "Booked"

### GET /api/esewa/failure  
eSewa failure callback - marks payment as failed and reverts booking to "Scheduled"

## Frontend Integration

The frontend receives form data from the backend and automatically creates and submits a form to eSewa using the proper payload structure.

## Payment Payload Structure

The eSewa payment form includes the following fields:
- `amount`: Base amount (e.g., "1000")
- `failure_url`: Backend failure callback URL
- `product_delivery_charge`: "0"
- `product_service_charge`: "0"
- `product_code`: "EPAYTEST" (merchant ID)
- `signature`: HMAC-SHA256 signature
- `signed_field_names`: "total_amount,transaction_uuid,product_code"
- `success_url`: Backend success callback URL
- `tax_amount`: 10% of base amount (e.g., "100")
- `total_amount`: Base amount + tax (e.g., "1100")
- `transaction_uuid`: Unique transaction identifier

## Testing

1. Start backend: `npm start` in `/backend`
2. Start frontend: `npm run dev` in `/frontend`
3. Create a booking and wait for vendor to schedule
4. Click "Book Vendor" → "Pay with eSewa"
5. Form will be automatically submitted to eSewa test environment
6. Complete the payment process on eSewa
7. Check your booking status in the application - it should be updated to "Booked"

## Status Flow

1. **Pending** - Initial booking request
2. **Accepted** - Vendor accepts the booking
3. **Scheduled** - Vendor schedules the service (shows "Book Vendor" button)
4. **Booked** - Customer confirms with payment (cash or eSewa)
5. **Completed** - Vendor marks service as completed

## Important Notes

- **Form Submission**: Uses proper form-based submission to eSewa
- **Signature Generation**: HMAC-SHA256 signature for security
- **Tax Calculation**: Automatically adds 10% tax to the base amount
- **Callback URLs**: Success/failure callbacks point to backend endpoints
- **Transaction Tracking**: Uses UUID for transaction identification
- **Optimistic Updates**: Booking status updated optimistically, reverted on failure