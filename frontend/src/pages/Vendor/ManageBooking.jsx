"use client"
import React from "react"
import { useEffect, useState } from "react"

const ManageBooking = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendorBookings()
  }, [])

  const fetchVendorBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching vendor bookings:", error)
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
        alert("Failed to update booking status")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Booking Requests</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-10 w-10 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No booking requests found.</div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-2xl p-6 shadow-md border border-white/40"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Event: {booking.eventId?.title}
                  </h2>
                  <p className="text-sm text-gray-600">Customer: {booking.customerId?.name}</p>
                  <p className="text-sm text-gray-600">Email: {booking.customerId?.email}</p>
                  <p className="text-sm text-gray-600">Date: {formatDate(booking.eventId?.date)}</p>
                  <p className="text-sm text-gray-600">Location: {booking.eventId?.location}</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.status === "Pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateBookingStatus(booking._id, "Accepted")}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking._id, "Rejected")}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {booking.message && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <strong>Message:</strong> {booking.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManageBooking
