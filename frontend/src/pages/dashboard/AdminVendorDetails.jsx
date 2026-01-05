"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const AdminVendorDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [vendorServices, setVendorServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem("role")
    if (userRole !== "admin") {
      alert("Admin access required")
      navigate("/login")
      return
    }
    
    fetchVendorDetails()
    fetchVendorServices()
  }, [id, navigate])

  const fetchVendorDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/vendors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setVendor(data)
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorServices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const allServices = await response.json()
        // Filter services by this vendor's userId
        const vendorSpecificServices = allServices.filter(
          (service) => service.createdBy && service.createdBy._id === vendor?.userId?._id,
        )
        setVendorServices(vendorSpecificServices)
      }
    } catch (error) {
      console.error("Error fetching vendor services:", error)
    } finally {
      setServicesLoading(false)
    }
  }

  // Re-fetch services when vendor data is loaded
  useEffect(() => {
    if (vendor && vendor.userId) {
      fetchVendorServices()
    }
  }, [vendor])

  const handleVerifyVendor = async (verified) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/vendors/admin/verify/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified }),
      })

      if (response.ok) {
        alert(`Vendor ${verified ? 'verified' : 'rejected'} successfully!`)
        fetchVendorDetails()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update vendor")
      }
    } catch (error) {
      console.error("Error updating vendor:", error)
      alert("Network error occurred")
    }
  }

  const handleFeatureVendor = async (featured) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/vendors/admin/feature/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured }),
      })

      if (response.ok) {
        alert(`Vendor ${featured ? 'featured' : 'unfeatured'} successfully!`)
        fetchVendorDetails()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update vendor")
      }
    } catch (error) {
      console.error("Error updating vendor:", error)
      alert("Network error occurred")
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vendor not found</h1>
          <button 
            onClick={() => navigate("/admin/dashboard")} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Admin Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="mr-4 flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Admin Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vendor Details</h1>
                <p className="text-gray-600">Admin view - Vendor management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                vendor.verified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {vendor.verified ? "Verified" : "Pending"}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                vendor.featured 
                  ? "bg-purple-100 text-purple-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {vendor.featured ? "Featured" : "Standard"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{vendor.businessName}</h2>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">{renderStars(vendor.rating)}</div>
                    <span className="text-lg text-gray-600">
                      {vendor.rating} ({vendor.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Owner Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Name:</strong> {vendor.userId?.name}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Email:</strong> {vendor.userId?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Member Since:</strong> {new Date(vendor.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600"><strong>Location:</strong> {vendor.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Business Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {vendor.description || "No description provided"}
                </p>
              </div>

              {/* Service Categories */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Service Categories</h3>
                <div className="flex flex-wrap gap-3">
                  {vendor.services.map((service, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio */}
              {vendor.portfolio && vendor.portfolio.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Portfolio</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {vendor.portfolio.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Services Offered Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Services Offered</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {vendorServices.length} Service{vendorServices.length !== 1 ? "s" : ""}
                </span>
              </div>

              {servicesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
              ) : vendorServices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">No Services Listed</h4>
                  <p className="text-gray-600">This vendor hasn't added any specific services yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vendorServices.map((service) => (
                    <div
                      key={service._id}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                    >
                      {/* Service Images */}
                      {service.images && service.images.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            {service.images.slice(0, 4).map((image, index) => (
                              <div
                                key={index}
                                className={`aspect-square bg-gray-200 rounded-lg overflow-hidden ${
                                  service.images.length === 1
                                    ? "col-span-2"
                                    : service.images.length === 3 && index === 0
                                      ? "col-span-2"
                                      : ""
                                }`}
                              >
                                <img
                                  src={`http://localhost:5000/${image}` || "/placeholder.svg"}
                                  alt={`Service ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          {service.images.length > 4 && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              +{service.images.length - 4} more images
                            </p>
                          )}
                        </div>
                      )}

                      {/* Service Details */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {service.serviceType ? service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1) + " Service" : "Service Package"}
                          </h4>
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">NPR {service.price}</div>
                            <div className="text-xs text-gray-500">Starting from</div>
                          </div>
                        </div>

                        {service.serviceType && (
                          <div className="mb-2">
                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)} Service
                            </span>
                          </div>
                        )}

                        <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>

                        <div className="text-xs text-gray-500 pt-2">
                          Added {new Date(service.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Admin Actions Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Admin Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleVerifyVendor(!vendor.verified)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    vendor.verified
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {vendor.verified ? "Unverify Vendor" : "Verify Vendor"}
                </button>
                <button
                  onClick={() => handleFeatureVendor(!vendor.featured)}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    vendor.featured
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {vendor.featured ? "Remove Featured Status" : "Make Featured"}
                </button>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span className="text-gray-700">{vendor.location}</span>
                </div>

                {vendor.contactInfo?.email && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700">{vendor.contactInfo.email}</span>
                  </div>
                )}

                {vendor.contactInfo?.phone && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Pricing Information</h3>
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  NPR {vendor.priceRange.min.toLocaleString()} - NPR {vendor.priceRange.max.toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">General price range</p>
              </div>
              {vendorServices.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Individual service prices:</p>
                  <div className="space-y-1">
                    {vendorServices.slice(0, 5).map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate mr-2">
                          {service.serviceType ? service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1) : `Service ${index + 1}`}
                        </span>
                        <span className="font-medium text-blue-600">NPR {service.price}</span>
                      </div>
                    ))}
                    {vendorServices.length > 5 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{vendorServices.length - 5} more services
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium">{vendor.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews:</span>
                  <span className="font-medium">{vendor.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Services:</span>
                  <span className="font-medium">{vendorServices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${vendor.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {vendor.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Featured:</span>
                  <span className={`font-medium ${vendor.featured ? 'text-purple-600' : 'text-gray-600'}`}>
                    {vendor.featured ? 'Yes' : 'No'}
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

export default AdminVendorDetails