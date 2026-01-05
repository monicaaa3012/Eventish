"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState({
    bookingId: searchParams.get('bookingId'),
    status: searchParams.get('status'),
    refId: searchParams.get('refId')
  })

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/vendor/manage-bookings')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your Esewa payment has been processed successfully.
        </p>

        {/* Payment Details */}
        {paymentDetails.bookingId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Payment Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Booking ID:</strong> {paymentDetails.bookingId}</p>
              {paymentDetails.refId && (
                <p><strong>Transaction ID:</strong> {paymentDetails.refId}</p>
              )}
              <p><strong>Status:</strong> <span className="text-green-600 font-medium">Completed</span></p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/vendor/manage-bookings')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Back to Manage Bookings
          </button>
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Auto redirect notice */}
        <p className="text-xs text-gray-500 mt-4">
          You will be automatically redirected to manage bookings in 5 seconds...
        </p>
      </div>
    </div>
  )
}

export default PaymentSuccess