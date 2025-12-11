"use client"
import { useState, useEffect } from "react"

const VendorMyReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMyReviews()
  }, [])

  const fetchMyReviews = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError("Please login to view your reviews")
        return
      }

      const res = await fetch("/api/vendors/my-reviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      } else {
        const errorData = await res.json()
        setError(errorData.message || "Failed to fetch reviews")
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {reviews.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">You haven't received any customer reviews yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">{review.user?.name || "Anonymous"}</h2>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
              </div>
            </div>
            <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
            <p className="text-sm text-gray-500">
              {new Date(review.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VendorMyReviews
