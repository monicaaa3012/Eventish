"use client"
import { useEffect, useState } from "react"

const ManageBooking = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchVendorBookings()
  }, [])

  const fetchVendorBookings = async () => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")
      const user = JSON.parse(localStorage.getItem("user"))

      if (!user || !user.id) {
        setError("User information not found. Please login again.")
        return
      }

      // First get the vendor profile to get vendorId
      const vendorResponse = await fetch(`/api/vendors/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!vendorResponse.ok) {
        throw new Error("Failed to fetch vendor profile")
      }

      const vendorData = await vendorResponse.json()

      // Then fetch bookings for this vendor
      const bookingsResponse = await fetch(`/api/bookings/vendor/${vendorData._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (bookingsResponse.ok) {
        const data = await bookingsResponse.json()
        setBookings(data)
      } else {
        throw new Error("Failed to fetch bookings")
      }
    } catch (error) {
      console.error("Error fetching vendor bookings:", error)
      setError(error.message || "Failed to fetch booking requests")
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchVendorBookings()
        alert(`Booking ${status.toLowerCase()} successfully!`)
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update booking status")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("Error updating booking status")
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 px-4 py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Booking Requests</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
            <p>{error}</p>
            <button
              onClick={fetchVendorBookings}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Booking Requests</h1>
          <button
            onClick={fetchVendorBookings}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-8 shadow-md border border-white/40 max-w-md mx-auto">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Booking Requests</h3>
              <p className="text-gray-600">You haven't received any booking requests yet.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl p-6 shadow-md border border-white/40 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  {/* Main Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-1">
                          {booking.eventId?.title || "Event Details Not Available"}
                        </h2>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                          <span className="text-sm text-gray-500">Requested {formatDate(booking.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Customer Details
                        </h3>
                        <p className="text-sm text-gray-600">
                          <strong>Name:</strong> {booking.customerId?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {booking.customerId?.email || "N/A"}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                            />
                          </svg>
                          Event Details
                        </h3>
                        <p className="text-sm text-gray-600">
                          <strong>Date:</strong> {booking.eventId?.date ? formatDate(booking.eventId.date) : "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Location:</strong> {booking.eventId?.location || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Service Info (if applicable) */}
                    {booking.serviceId && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          Requested Service
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Service:</strong> {booking.serviceId?.description || "Service details not available"}
                        </p>
                        {booking.servicePrice && (
                          <p className="text-sm text-gray-600">
                            <strong>Price:</strong> {formatPrice(booking.servicePrice)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Customer Message */}
                    {booking.message && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          Customer Message
                        </h3>
                        <p className="text-sm text-gray-700 italic">"{booking.message}"</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    {booking.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking._id, "Accepted")}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Accept Booking
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id, "Rejected")}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Reject Booking
                        </button>
                      </>
                    )}

                    {booking.status === "Accepted" && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, "Completed")}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Mark Complete
                      </button>
                    )}

                    {(booking.status === "Rejected" ||
                      booking.status === "Completed" ||
                      booking.status === "Cancelled") && (
                      <div className="text-center py-4">
                        <span className="text-sm text-gray-500">No actions available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageBooking
