import { useState, useEffect } from "react"

const ReviewsList = ({ vendorId, showTitle = true, maxReviews = null }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (vendorId) {
      fetchReviews()
    }
  }, [vendorId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendors/${vendorId}/reviews`)
      
      if (response.ok) {
        const data = await response.json()
        let reviewsToShow = data.reviews || []
        
        // Limit reviews if maxReviews is specified
        if (maxReviews && reviewsToShow.length > maxReviews) {
          reviewsToShow = reviewsToShow.slice(0, maxReviews)
        }
        
        setReviews(reviewsToShow)
      } else {
        setError("Failed to load reviews")
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Error loading reviews")
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {showTitle && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Customer Reviews ({reviews.length})
        </h3>
      )}
      
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-800">
                    {review.user?.name || "Anonymous User"}
                  </span>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
          
          {maxReviews && reviews.length >= maxReviews && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Showing {maxReviews} of many reviews
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsList