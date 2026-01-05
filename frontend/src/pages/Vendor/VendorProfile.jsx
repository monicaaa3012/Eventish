"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const VendorProfile = () => {
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchVendorProfile()
  }, [])

  const fetchVendorProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await fetch("/api/vendors/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVendor(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to fetch vendor profile")
      }
    } catch (error) {
      console.error("Error fetching vendor profile:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/vendor/update-profile")}
              className="w-full bg-primary-gradient text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Profile
            </button>
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if vendor has a complete profile
  const hasCompleteProfile = vendor && vendor.businessName && vendor.location

  if (!hasCompleteProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Set up your vendor profile to start receiving bookings and showcase your services.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/vendor/update-profile")}
              className="w-full bg-primary-gradient text-white px-4 py-2 rounded-lg font-medium"
            >
              Complete Profile
            </button>
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/vendor/dashboard")}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/20">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    {vendor.profileImage && (
                      <img
                        src={vendor.profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover mr-6 border-4 border-white shadow-lg"
                        onError={(e) => {
                          e.target.style.display = "none"
                        }}
                      />
                    )}
                    <div>
                      <h1 className="text-4xl font-bold text-gray-800 mb-2">{vendor.businessName || vendor.name}</h1>
                      {vendor.companyName && <p className="text-lg text-gray-600 mb-2">{vendor.companyName}</p>}
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-4">{renderStars(vendor.rating || 5.0)}</div>
                        <span className="text-lg text-gray-600">
                          {vendor.rating || 5.0} ({vendor.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {vendor.featured && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-medium">
                    Featured Vendor
                  </span>
                )}
              </div>

              {/* Bio */}
              {vendor.bio && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">About Me</h2>
                  <p className="text-gray-600 leading-relaxed">{vendor.bio}</p>
                </div>
              )}

              {/* Description */}
              {vendor.description && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Description</h2>
                  <p className="text-gray-600 leading-relaxed">{vendor.description}</p>
                </div>
              )}

              {/* Services */}
              {vendor.services && vendor.services.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Services</h2>
                  <div className="flex flex-wrap gap-3">
                    {vendor.services.map((service, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 rounded-full font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {vendor.portfolio && vendor.portfolio.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Portfolio</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {vendor.portfolio.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Profile Button */}
              <div className="mt-8">
                <button
                  onClick={() => navigate("/vendor/update-profile")}
                  className="bg-primary-gradient text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{vendor.location || "Location not specified"}</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {vendor.email || vendor.contactInfo?.email || "Email not provided"}
                  </span>
                </div>

                {vendor.contactInfo?.phone && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-gray-700">{vendor.contactInfo.phone}</span>
                  </div>
                )}

                {vendor.contactInfo?.website && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                      />
                    </svg>
                    <a
                      href={vendor.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Card */}
            {vendor.priceRange && (vendor.priceRange.min > 0 || vendor.priceRange.max > 0) && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Pricing</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    NPR {vendor.priceRange.min.toLocaleString()} - NPR {vendor.priceRange.max.toLocaleString()}
                  </div>
                  <p className="text-gray-600 text-sm">Starting price range</p>
                </div>
              </div>
            )}

            {/* Profile Status */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {vendor.verified ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Featured</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vendor.featured ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {vendor.featured ? "Featured" : "Standard"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-800 text-sm">
                    {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorProfile