import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")
    
    console.log("Wishlist page - Auth check:", { token: !!token, role })
    
    if (!token || role !== "user") {
      console.log("Redirecting to login - no token or not a user")
      navigate("/login")
      return
    }
    
    fetchWishlist()
  }, [navigate])

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/auth/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login")
          return
        }
        throw new Error("Failed to fetch wishlist")
      }

      const data = await response.json()
      console.log("Wishlist data received:", data.wishlist)
      if (data.wishlist && data.wishlist.length > 0) {
        console.log("First vendor images:", data.wishlist[0].images)
        console.log("First vendor full data:", data.wishlist[0])
      }
      setWishlist(data.wishlist || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (vendorId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/auth/wishlist/${vendorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to remove from wishlist")

      setWishlist(wishlist.filter(vendor => vendor._id !== vendorId))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-purple-600 fill-purple-600" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Start adding vendors you like to your wishlist</p>
            <button
              onClick={() => navigate("/vendors")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Vendors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((vendor) => {
              console.log(`Rendering vendor ${vendor.businessName}:`, {
                hasImages: vendor.images && vendor.images.length > 0,
                images: vendor.images,
                firstImage: vendor.images?.[0]
              })
              return (
              <div
                key={vendor._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  {vendor.images && vendor.images.length > 0 ? (
                    <img
                      src={
                        vendor.images[0].startsWith('http') 
                          ? vendor.images[0] 
                          : `http://localhost:5000/${vendor.images[0].replace(/\\/g, '/')}`
                      }
                      alt={vendor.businessName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src)
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center"
                    style={{ display: vendor.images && vendor.images.length > 0 ? 'none' : 'flex' }}
                  >
                    <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => removeFromWishlist(vendor._id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Remove from wishlist"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {vendor.businessName}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    {vendor.category && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {vendor.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{vendor.location}</span>
                  </div>

                  {vendor.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({vendor.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {vendor.description}
                  </p>

                  <button
                    onClick={() => navigate(`/vendors/${vendor._id}`)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
