import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

const EsewaFailure = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleFailure = async () => {
      try {
        const oid = searchParams.get("oid")
        
        if (oid) {
          // Extract booking ID from order ID
          const bookingId = oid.replace('BOOKING_', '')
          
          const token = localStorage.getItem("token")
          await fetch("/api/esewa/failure", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        }
      } catch (error) {
        console.error("Error handling payment failure:", error)
      } finally {
        setLoading(false)
      }
    }

    handleFailure()
  }, [searchParams])

  const handleRetryPayment = () => {
    navigate("/bookings")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-red-600 font-medium">Processing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-red-800 mb-4">Payment Cancelled</h2>
          
          <p className="text-gray-600 mb-8">
            Your payment was cancelled or failed. You can try again or choose a different payment method.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Try Again
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EsewaFailure