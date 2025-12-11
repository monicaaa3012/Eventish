"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const BookingManagement = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("customer") // customer or vendor
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const userRole = localStorage.getItem("role")

  useEffect(() => {
    fetchBookings()
  }, [activeTab])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const endpoint = activeTab === "customer" ? "/api/bookings/customer" : "/api/bookings/vendor"

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this booking?`)) {
      return
    }

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
        const result = await response.json()
        showToast(result.message || `Booking ${status.toLowerCase()} successfully!`, "success")
        fetchBookings()
      } else {
        const errorData = await response.json()
        showToast(errorData.message || "Failed to update booking status", "error")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      showToast("Error updating booking status", "error")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
        return "bg-yellow-100 text-yellow-800 border border-yellow-300"
      case "Accepted":
        return "bg-green-100 text-green-800 border border-green-300"
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border border-blue-300"
      case "In Progress":
        return "bg-purple-100 text-purple-800 border border-purple-300"
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300"
      case "Rejected":
        return "bg-red-100 text-red-800 border border-red-300"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "Accepted":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "Scheduled":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case "In Progress":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "Completed":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gradient">Booking Management</h1>
              <p className="text-gray-600">Manage your booking requests and responses</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-8 border border-white/20">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("customer")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                activeTab === "customer"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              My Booking Requests
            </button>
            {userRole === "vendor" && (
              <button
                onClick={() => setActiveTab("vendor")}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                  activeTab === "vendor"
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-purple-600"
                }`}
              >
                Received Requests
              </button>
            )}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No bookings found</h3>
            <p className="text-gray-600 mb-8">
              {activeTab === "customer"
                ? "You haven't made any booking requests yet."
                : "You haven't received any booking requests yet."}
            </p>
            {activeTab === "customer" && (
              <button
                onClick={() => navigate("/vendors")}
                className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Browse Vendors
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {activeTab === "customer" ? booking.vendorId?.businessName : booking.eventId?.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            Requested {formatDate(booking.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {activeTab === "customer" ? (
                        <>
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Event Details
                            </h4>
                            <p className="text-sm text-gray-700 mb-1">
                              <strong>Event:</strong> {booking.eventId?.title}
                            </p>
                            <p className="text-sm text-gray-700 mb-1">
                              <strong>Date:</strong> {formatDate(booking.eventId?.date)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Location:</strong> {booking.eventId?.location}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100">
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              Vendor
                            </h4>
                            <p className="text-sm text-gray-700">
                              <strong>Business:</strong> {booking.vendorId?.businessName}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                            <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
                            <p className="text-sm text-gray-700 mb-1">
                              <strong>Name:</strong> {booking.customerId?.name}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Email:</strong> {booking.customerId?.email}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-4 border border-pink-100">
                            <h4 className="font-semibold text-gray-800 mb-2">Event Details</h4>
                            <p className="text-sm text-gray-700 mb-1">
                              <strong>Date:</strong> {formatDate(booking.eventId?.date)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Location:</strong> {booking.eventId?.location}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {booking.scheduledDate && (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border border-blue-200">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Scheduled Service
                        </h4>
                        <p className="text-sm text-blue-700 font-semibold">
                          {formatDate(booking.scheduledDate)}
                          {booking.scheduledTime && ` at ${booking.scheduledTime}`}
                        </p>
                      </div>
                    )}

                    {booking.message && (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                        <h4 className="font-semibold text-gray-800 mb-2">Message</h4>
                        <p className="text-sm text-gray-700 italic">"{booking.message}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {activeTab === "vendor" && booking.status === "Pending" && (
                    <div className="flex space-x-3 mt-4 lg:mt-0 lg:ml-6">
                      <button
                        onClick={() => updateBookingStatus(booking._id, "Accepted")}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking._id, "Rejected")}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {activeTab === "customer" && (
                    <div className="flex space-x-3 mt-4 lg:mt-0 lg:ml-6">
                      <button
                        onClick={() => navigate(`/vendors/${booking.vendorId._id}`)}
                        className="bg-primary-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                      >
                        View Vendor
                      </button>
                      {booking.status === "Completed" && (
                        <button
                          onClick={() => navigate(`/bookings/${booking._id}/review`)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                        >
                          Leave Review
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-3 lg:min-w-[180px]">
                    {activeTab === "customer" && (
                      <>
                        {(booking.status === "Pending" || booking.status === "Accepted") && (
                          <button
                            onClick={() => updateBookingStatus(booking._id, "Cancelled")}
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Booking
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/vendors/${booking.vendorId._id}`)}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          View Vendor
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div
            className={`${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-red-500 to-pink-500"
            } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}
          >
            {toast.type === "success" ? (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingManagement
