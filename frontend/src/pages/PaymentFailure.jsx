"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const PaymentFailure = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState({
    bookingId: searchParams.get('bookingId'),
    status: searchParams.get('status'),
    error: searchParams.get('error')
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Failure Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Failure Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Unfortunately, your Esewa payment could not be processed. Please try again.
        </p>

        {/* Error Details */}
        {paymentDetails.bookingId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Payment Details:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Booking ID:</strong> {paymentDetails.bookingId}</p>
              <p><strong>Status:</strong> <span className="text-red-600 font-medium">Failed</span></p>
              {paymentDetails.error && (
                <p><strong>Error:</strong> {paymentDetails.error.replace('_', ' ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Common Reasons */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">Common Reasons:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Insufficient balance in Esewa account</li>
            <li>• Network connectivity issues</li>
            <li>• Payment was cancelled by user</li>
            <li>• Technical issues with payment gateway</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/vendor/manage-bookings')}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Payment Again
          </button>
          <button
            onClick={() => navigate('/vendor/dashboard')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Support Info */}
        <p className="text-xs text-gray-500 mt-4">
          If you continue to experience issues, please contact support.
        </p>
      </div>
    </div>
  )
}

export default PaymentFailure