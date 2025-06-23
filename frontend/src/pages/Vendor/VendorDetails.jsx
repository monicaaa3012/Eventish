"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const VendorDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [vendorServices, setVendorServices] = useState([])
  const [userEvents, setUserEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [servicesLoading, setServicesLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    eventId: "",
    message: "",
  })

  useEffect(() => {
    fetchVendorDetails()
    fetchVendorServices()
    fetchUserEvents()
  }, [id])

  const fetchVendorDetails = async () => {
    try {
      const response = await fetch(`/api/vendors/${id}`)
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
      const response = await fetch("/api/services")
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

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/events/my-events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUserEvents(data)
      }
    } catch (error) {
      console.error("Error fetching user events:", error)
    }
  }

  const handleBooking = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId: id,
          eventId: bookingData.eventId,
          message: bookingData.message,
        }),
      })

      if (response.ok) {
        alert("Booking request sent successfully!")
        setShowBookingModal(false)
        setBookingData({ eventId: "", message: "" })
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to send booking request")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Network error. Please try again.")
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
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Vendor not found</h1>
          <button onClick={() => navigate("/vendors")} className="bg-primary-gradient text-white px-6 py-3 rounded-lg">
            Back to Vendors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/vendors")}
          className="mb-6 flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Vendors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vendor Info Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/20">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{vendor.businessName}</h1>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">{renderStars(vendor.rating)}</div>
                    <span className="text-lg text-gray-600">
                      {vendor.rating} ({vendor.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                {vendor.featured && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-medium">
                    Featured Vendor
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">
                  {vendor.description || "Professional service provider committed to making your event exceptional."}
                </p>
              </div>

              {/* Service Categories */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Categories</h2>
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
            </div>

            {/* Services Offered Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Services Offered</h2>
                <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {vendorServices.length} Service{vendorServices.length !== 1 ? "s" : ""}
                </span>
              </div>

              {servicesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                </div>
              ) : vendorServices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Services Listed</h3>
                  <p className="text-gray-600">This vendor hasn't added any specific services yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vendorServices.map((service) => (
                    <div
                      key={service._id}
                      className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                            Service Package
                          </h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">${service.price}</div>
                            <div className="text-xs text-gray-500">Starting from</div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{service.description}</p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-gray-500">
                            Added {new Date(service.createdAt).toLocaleDateString()}
                          </div>
                         
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
                  <span className="text-gray-700">{vendor.location}</span>
                </div>

                {vendor.contactInfo?.email && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Pricing Range</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ${vendor.priceRange.min.toLocaleString()} - ${vendor.priceRange.max.toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">General price range</p>
              </div>
              {vendorServices.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Service prices:</p>
                  <div className="space-y-1">
                    {vendorServices.slice(0, 3).map((service, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">Service {index + 1}</span>
                        <span className="font-medium text-purple-600">${service.price}</span>
                      </div>
                    ))}
                    {vendorServices.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{vendorServices.length - 3} more services
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Book Now Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Book This Vendor</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Send a booking request to connect with this vendor for your event.
              </p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full bg-primary-gradient text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Send Booking Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Booking Request</h2>

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                <select
                  value={bookingData.eventId}
                  onChange={(e) => setBookingData((prev) => ({ ...prev, eventId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Choose an event</option>
                  {userEvents.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  value={bookingData.message}
                  onChange={(e) => setBookingData((prev) => ({ ...prev, message: e.target.value }))}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tell the vendor about your event requirements..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-gradient text-white px-4 py-2 rounded-lg font-medium"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDetails
