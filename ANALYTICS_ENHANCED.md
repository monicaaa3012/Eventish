# Enhanced Analytics System

## Overview

The analytics system has been significantly enhanced to provide comprehensive business insights for vendors, including payment analytics, advance payments, service performance, and revenue tracking.

## New Features Added

### 1. Payment Analytics
- **Total Revenue**: Actual money received from completed payments
- **Potential Revenue**: Total value of all bookings (including pending)
- **Pending Revenue**: Money yet to be received
- **Pending Payments Count**: Number of bookings awaiting payment

### 2. Advance Payment Tracking
- **Total Advance Payments**: Sum of all advance payments received
- **Completed Advance Payments**: Advance payments that have been processed
- **Pending Advance Payments**: Advance payments awaiting processing
- **Average Advance Payment**: Average amount received as advance
- **Advance Payments Count**: Number of bookings with advance payments

### 3. Payment Method Breakdown
- **Method-wise Statistics**: Revenue and transaction count per payment method
- **eSewa vs Cash**: Separate tracking for digital and cash payments
- **Percentage Distribution**: Shows what % of payments use each method
- **Visual Icons**: Different icons for eSewa (wallet) and Cash

### 4. Enhanced Revenue Metrics
- **Year to Date Revenue**: Total revenue for current year
- **Monthly Revenue Growth**: Percentage change from last month
- **Growth Indicators**: Visual up/down arrows with color coding
- **Revenue Comparison**: This month vs last month

### 5. Service Performance Enhancements
- **Potential Revenue per Service**: What each service could earn
- **Advance Payments per Service**: Advance payments received per service
- **Revenue vs Potential**: Shows actual vs potential earnings
- **Performance Ranking**: Services ranked by performance score

### 6. Monthly Trend Analysis
- **Last 6 Months Data**: Booking and revenue trends
- **Month-over-Month Comparison**: Track growth patterns
- **Visual Trend Indicators**: Easy to spot patterns

## API Response Structure

```json
{
  "totalBookings": 50,
  "activeBookings": 15,
  "completedBookings": 30,
  "totalRevenue": 150000,
  "totalPotentialRevenue": 200000,
  "pendingRevenue": 50000,
  "monthlyRevenue": 45000,
  "lastMonthRevenue": 40000,
  "yearToDateRevenue": 150000,
  "monthlyRevenueGrowth": 12.5,
  "averageEarningPerBooking": 5000,
  "pendingPaymentsCount": 10,
  
  "totalAdvancePayments": 75000,
  "advancePaymentsCount": 25,
  "averageAdvancePayment": 3000,
  "completedAdvancePayments": 60000,
  "pendingAdvancePayments": 15000,
  
  "paymentMethods": [
    {
      "method": "esewa",
      "count": 20,
      "totalAmount": 100000,
      "percentage": "66.7"
    },
    {
      "method": "cash",
      "count": 10,
      "totalAmount": 50000,
      "percentage": "33.3"
    }
  ],
  
  "topPerformingService": {
    "name": "Wedding Photography",
    "bookingCount": 15,
    "revenue": 75000,
    "potentialRevenue": 90000,
    "completionRate": "93.3",
    "performanceScore": 95.5,
    "advancePaymentsReceived": 30000
  },
  
  "servicePerformance": [
    {
      "serviceName": "Wedding Photography",
      "bookingCount": 15,
      "revenue": 75000,
      "potentialRevenue": 90000,
      "completedBookings": 14,
      "completionRate": "93.3",
      "performanceScore": 95.5,
      "rank": 1,
      "averagePrice": 5000,
      "advancePaymentsReceived": 30000
    }
  ],
  
  "monthlyTrend": [
    {
      "month": "2024-08",
      "bookings": 8,
      "revenue": 40000
    }
  ]
}
```

## Mobile UI Sections

### 1. Key Metrics Cards
- Active Bookings (Blue)
- Completed (Green)
- Cancelled (Red)
- Pending (Orange)

### 2. Revenue Card
- Total Revenue (Received) - Purple
- Potential Revenue - Gray
- Pending Payments - Orange with count
- This Month - with growth indicator
- Year to Date
- Average per Booking

### 3. Advance Payments Card (Orange theme)
- Total Received
- Pending
- Total Bookings with advance
- Average Amount

### 4. Payment Methods
- eSewa transactions with wallet icon
- Cash transactions with cash icon
- Shows count, percentage, and total amount
- Color-coded (Green for eSewa, Blue for Cash)

### 5. Customer Satisfaction
- Average Rating with star icon
- Total Reviews count

### 6. Top Performing Service (Green theme)
- Service name
- Bookings count
- Revenue (received)
- Potential revenue
- Completion rate
- Performance score
- Advance payments (if any)

### 7. Service Performance Ranking
- Ranked list with badges (#1, #2, #3)
- Color-coded cards (Green, Blue, Orange for top 3)
- Shows all metrics per service
- Advance payments highlighted in green

## Color Coding

- **Revenue (Received)**: Purple (#8B5CF6)
- **Potential Revenue**: Gray (#6B7280)
- **Pending**: Orange (#F59E0B)
- **Advance Payments**: Orange theme (#F59E0B)
- **Growth Positive**: Green (#10B981)
- **Growth Negative**: Red (#EF4444)
- **eSewa**: Green (#10B981)
- **Cash**: Blue (#3B82F6)

## Calculations

### Performance Score
```
Performance Score = 
  (Normalized Bookings × 0.4) +
  (Normalized Revenue × 0.4) +
  (Completion Rate × 0.2)
```

### Monthly Revenue Growth
```
Growth % = ((This Month - Last Month) / Last Month) × 100
```

### Completion Rate
```
Completion Rate = (Completed Bookings / Total Bookings) × 100
```

## Backend Aggregations

### Revenue Aggregation
- Filters by `paymentStatus: "completed"` for actual revenue
- Includes all bookings with prices for potential revenue
- Separates pending payments

### Advance Payment Aggregation
- Filters bookings with `advancePayment > 0`
- Separates completed vs pending advance payments
- Calculates average advance payment amount

### Payment Method Aggregation
- Groups by `paymentMethod` field
- Only includes completed payments
- Calculates percentage distribution

### Service Performance Aggregation
- Joins with Services collection
- Groups by service ID
- Calculates revenue, bookings, completion rate
- Includes advance payments per service

## Usage

### For Vendors
1. Go to Vendor Dashboard
2. Tap "Analytics" button
3. View comprehensive business metrics
4. Pull to refresh for latest data

### Key Insights
- **Revenue Health**: Compare received vs potential revenue
- **Payment Status**: Track pending payments
- **Service Performance**: Identify best-performing services
- **Payment Preferences**: See customer payment method preferences
- **Advance Payments**: Monitor advance payment collection
- **Growth Trends**: Track month-over-month growth

## Testing

### Create Test Data
1. Create multiple bookings with different services
2. Set some bookings to "Completed" with `paymentStatus: "completed"`
3. Add `advancePayment` amounts to some bookings
4. Use different `paymentMethod` values (esewa, cash)
5. Refresh analytics to see data

### Expected Results
- Revenue metrics show correct totals
- Advance payments calculated accurately
- Payment methods show correct distribution
- Service ranking reflects actual performance
- Growth indicators show correct trends

## Performance Considerations

- Uses MongoDB aggregation pipelines for efficiency
- Indexes on `vendorId`, `paymentStatus`, `createdAt`
- Caches vendor profile lookup
- Limits service performance to top services
- Monthly trend limited to last 6 months

## Future Enhancements

- [ ] Date range filters
- [ ] Export analytics as PDF/CSV
- [ ] Comparison with industry averages
- [ ] Predictive analytics
- [ ] Customer demographics
- [ ] Booking source tracking
- [ ] Seasonal trends analysis
- [ ] Revenue forecasting

## Troubleshooting

### No Data Showing
- Check if vendor has any bookings
- Verify bookings have `servicePrice` set
- Ensure `paymentStatus` is set correctly

### Incorrect Revenue
- Check `paymentStatus` field on bookings
- Verify `servicePrice` is a number
- Ensure completed bookings have payment status

### Missing Advance Payments
- Check if bookings have `advancePayment` field
- Verify advance payment amounts are > 0
- Ensure payment status is set

### Payment Methods Not Showing
- Check if bookings have `paymentMethod` field
- Verify payment status is "completed"
- Ensure method is either "esewa" or "cash"

## API Endpoint

```
GET /api/analytics/vendor
Authorization: Bearer <vendor_token>
```

Returns comprehensive analytics object with all metrics.

## Mobile Screen Location

```
app/(vendor)/analytics.tsx
```

Accessible from Vendor Dashboard "Analytics" button.
