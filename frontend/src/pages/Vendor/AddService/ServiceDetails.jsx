import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const ServiceDetails = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/services/${serviceId}`)
        if (response.ok) {
          const serviceData = await response.json()
          setService(serviceData)

          // Fetch vendor details
          if (serviceData.createdBy) {
            const vendorResponse = await fetch(`http://localhost:5000/api/vendors/user/${serviceData.createdBy._id}`)
            if (vendorResponse.ok) {
              const vendorData = await vendorResponse.json()
              setVendor(vendorData)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching service details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceDetails()
  }, [serviceId])

  const nextImage = () => {
    if (service?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % service.images.length)
      setImageError(false)
    }
  }

  const prevImage = () => {
    if (service?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + service.images.length) % service.images.length)
      setImageError(false)
    }
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    // Handle both full paths and relative paths
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    return `http://localhost:5000/${cleanPath}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Service not found</h1>
          <button onClick={() => navigate(-1)} className="bg-primary-gradient text-white px-6 py-3 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="mb-6 text-purple-600 hover:underline">
          &larr; Back
        </button>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden border border-white/20">
          {/* Service Image Gallery */}
          {service.images && service.images.length > 0 ? (
            <div className="relative bg-gray-100">
              <div className="relative aspect-video w-full overflow-hidden">
                {!imageError ? (
                  <img
                    src={getImageUrl(service.images[currentImageIndex])}
                    alt={`${service.serviceType ? service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1) + " Service" : "Service"} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm">Image not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {service.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all duration-200 backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-3 rounded-full text-white transition-all duration-200 backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {service.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {service.images.length}
                </div>
              )}

              {/* Thumbnail Navigation */}
              {service.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {service.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setImageError(false)
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video w-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-20 w-20 text-gray-400 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500">No images available</p>
              </div>
            </div>
          )}

          {/* Service Info */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {service.serviceType ? service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1) + " Service" : "Service Details"}
                </h1>
                {service.serviceType && (
                  <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {service.serviceType.charAt(0).toUpperCase() + service.serviceType.slice(1)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  NPR {service.price}
                </div>
                {service.priceUnit && (
                  <div className="text-sm text-gray-500">per {service.priceUnit}</div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {service.description || "No description available"}
              </p>
            </div>

            {/* Service Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {service.duration && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium text-gray-800">{service.duration}</div>
                  </div>
                </div>
              )}
              
              {service.availability && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Availability</div>
                    <div className="font-medium text-gray-800">{service.availability}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Added on</div>
                  <div className="font-medium text-gray-800">
                    {new Date(service.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {service.location && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="font-medium text-gray-800">{service.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Section */}
            <div className="border-t pt-6 mt-6 mb-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Book This Service</h2>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 mb-2">
                      Interested in this service? Contact the vendor to discuss your requirements and get a personalized quote.
                    </p>
                    <div className="text-3xl font-bold text-purple-600">
                      NPR {service.price}
                    </div>
                    <p className="text-sm text-gray-500">Starting price</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const token = localStorage.getItem("token")
                      if (!token) {
                        navigate("/login")
                      } else {
                        // Navigate to vendor details for booking
                        if (vendor) {
                          navigate(`/vendors/${vendor._id}`)
                        }
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => {
                      if (vendor) {
                        navigate(`/vendors/${vendor._id}`)
                      }
                    }}
                    className="px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    View Vendor
                  </button>
                </div>
              </div>
            </div>

            {/* Vendor Info */}
            {vendor && (
              <div className="border-t pt-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About the Vendor</h2>
                <div className="flex items-start gap-4">
                  {vendor.logo && (
                    <img
                      src={getImageUrl(vendor.logo)}
                      alt={vendor.businessName}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {vendor.businessName}
                    </h3>
                    {vendor.description && (
                      <p className="text-gray-600 mb-3">{vendor.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {vendor.location && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {vendor.location}
                        </div>
                      )}
                      {vendor.rating && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          {vendor.rating} / 5
                        </div>
                      )}
                    </div>
                                     </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetails
