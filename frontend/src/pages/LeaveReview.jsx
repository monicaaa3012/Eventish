"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const LeaveReview = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [booking, setBooking] = useState(null)
  const [loadingBooking, setLoadingBooking] = useState(true)

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoadingBooking(true)
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data)
        
        // Check if booking is completed
        if (data.status !== "Completed") {
          setError("You can only review completed bookings")
          return
        }
      } else {
        setError("Booking not found or you don't have permission to review it")
      }
    } catch (err) {
      console.error("Error fetching booking:", err)
      setError("Failed to load booking details")
    } finally {
      setLoadingBooking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await fetch(`/api/bookings/${bookingId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: Number(rating), comment }),
      })

      if (response.ok) {
        alert("Review submitted successfully!")
        navigate(-1)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to submit review")
      }
    } catch (err) {
      console.error("Error submitting review:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingBooking) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-xl shadow-xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-xl shadow-xl">
        <div className="text-center">
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Leave a Review</h2>
      
      {booking && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Vendor:</strong> {booking.vendorId?.businessName}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Event:</strong> {booking.eventId?.title}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Date:</strong> {new Date(booking.eventId?.date).toLocaleDateString()}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-2">Rating</label>
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                disabled={loading}
                className={`text-2xl ${
                  star <= rating ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 ? `${rating}/5` : "Click to rate"}
            </span>
          </div>
          <input
            type="hidden"
            value={rating}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Your Review</label>
          <textarea
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Share your experience..."
            required
            disabled={loading}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="w-full mt-2 bg-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </form>
    </div>
  )
}

export default LeaveReview