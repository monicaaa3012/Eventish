"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const BookingManagement = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("customer") // customer or vendor
  const userRole = localStorage.getItem("role")

  useEffect(() => {
    fetchBookings()
  }, [activeTab])

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
        fetchBookings() // Refresh the list
        alert(`Booking ${status.toLowerCase()} successfully!`)
      } else {
        alert("Failed to update booking status")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("Error updating booking status")
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
        return "bg-yellow-100 text-yellow-800"
      case "Accepted":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {activeTab === "customer" ? booking.vendorId?.businessName : booking.eventId?.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          {activeTab === "customer" ? (
                            <>
                              <p>
                                <strong>Event:</strong> {booking.eventId?.title}
                              </p>
                              <p>
                                <strong>Event Date:</strong> {formatDate(booking.eventId?.date)}
                              </p>
                              <p>
                                <strong>Location:</strong> {booking.eventId?.location}
                              </p>
                            </>
                          ) : (
                            <>
                              <p>
                                <strong>Customer:</strong> {booking.customerId?.name}
                              </p>
                              <p>
                                <strong>Email:</strong> {booking.customerId?.email}
                              </p>
                              <p>
                                <strong>Event Date:</strong> {formatDate(booking.eventId?.date)}
                              </p>
                              <p>
                                <strong>Location:</strong> {booking.eventId?.location}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {booking.message && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Message:</strong> {booking.message}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">Requested on {formatDate(booking.createdAt)}</div>
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
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <button
                        onClick={() => navigate(`/vendors/${booking.vendorId._id}`)}
                        className="bg-primary-gradient text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                      >
                        View Vendor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingManagement
