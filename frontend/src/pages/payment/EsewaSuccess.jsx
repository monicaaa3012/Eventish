import { useEffect, useState } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom"

const EsewaSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Check if this is a simulated payment
        const isSimulated = searchParams.get("simulated") === "true"
        
        if (isSimulated) {
          // Handle simulated payment
          const stateMessage = location.state?.message
          const stateBooking = location.state?.booking
          
          if (stateMessage && stateBooking) {
            setSuccess(true)
            setMessage(stateMessage)
          } else {
            setSuccess(false)
            setMessage("Simulated payment verification failed")
          }
          setLoading(false)
          return
        }

        // Handle real eSewa payment verification
        const oid = searchParams.get("oid")
        const amt = searchParams.get("amt")
        const refId = searchParams.get("refId")
        
        if (oid && amt && refId) {
          // eSewa success callback - payment already verified by backend
          setSuccess(true)
          setMessage("Payment successful! Your booking has been confirmed.")
          setLoading(false)
          return
        }

        // If no eSewa parameters, show error
        setSuccess(false)
        setMessage("Invalid payment response")
        setLoading(false)
      } catch (error) {
        console.error("Error verifying payment:", error)
        setSuccess(false)
        setMessage("Error verifying payment")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams, location.state])

  const handleGoToBookings = () => {
    navigate("/bookings")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            success ? "bg-green-100" : "bg-red-100"
          }`}>
            {success ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 ${
            success ? "text-green-800" : "text-red-800"
          }`}>
            {success ? "Payment Successful!" : "Payment Failed"}
          </h2>
          
          <p className="text-gray-600 mb-8">{message}</p>
          
          <div className="space-y-4">
            <button
              onClick={handleGoToBookings}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Go to My Bookings
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

export default EsewaSuccess