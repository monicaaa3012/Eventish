"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { formatSimpleNPR } from "../../utils/currency.js"

const VendorAnalytics = () => {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      console.log("Fetching analytics with token:", token ? "Present" : "Missing")

      const response = await fetch("http://localhost:5000/api/analytics/vendor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Analytics response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Analytics data received:", data)
        setAnalytics(data)
      } else {
        const errorData = await response.json()
        console.error("Analytics error response:", errorData)
        setError(errorData.message || "Failed to fetch analytics")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, textColor = "text-blue-600" }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Track your business performance and insights</p>
            </div>
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Key Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Active Bookings"
              value={analytics?.activeBookings || 0}
              textColor="text-blue-600"
            />
            <StatCard
              title="Completed Bookings"
              value={analytics?.completedBookings || 0}
              textColor="text-green-600"
            />
            <StatCard
              title="Cancelled Bookings"
              value={analytics?.cancelledBookings || 0}
              textColor="text-red-600"
            />
            <StatCard
              title="Pending Bookings"
              value={analytics?.pendingBookings || 0}
              textColor="text-yellow-600"
            />
          </div>
        </div>

        {/* Detailed Booking Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Status Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Bookings"
              value={analytics?.totalBookings || 0}
              textColor="text-gray-600"
            />
            <StatCard
              title="Accepted"
              value={analytics?.acceptedBookings || 0}
              textColor="text-emerald-600"
            />
            <StatCard
              title="Scheduled"
              value={analytics?.scheduledBookings || 0}
              textColor="text-blue-600"
            />
            <StatCard
              title="In Progress"
              value={analytics?.inProgressBookings || 0}
              textColor="text-purple-600"
            />
            <StatCard
              title="Rejected"
              value={analytics?.rejectedBookings || 0}
              textColor="text-red-600"
            />
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatSimpleNPR(analytics?.totalRevenue || 0)}
              textColor="text-purple-600"
            />
            <StatCard
              title="Monthly Revenue"
              value={formatSimpleNPR(analytics?.monthlyRevenue || 0)}
              textColor="text-indigo-600"
            />
            <StatCard
              title="Average Earning per Booking"
              value={formatSimpleNPR(analytics?.averageEarningPerBooking || 0)}
              textColor="text-teal-600"
            />
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Satisfaction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Average Rating"
              value={`${(analytics?.averageRating || 0).toFixed(1)}/5.0`}
              textColor="text-yellow-600"
            />
            <StatCard
              title="Total Reviews"
              value={analytics?.totalReviews || 0}
              textColor="text-pink-600"
            />
          </div>
        </div>

        {/* Service Performance */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Service Performance</h2>
          
          {/* Top Performing Service Highlight */}
          {analytics?.topPerformingService && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">🏆 Top Performing Service</h3>
                  <p className="text-2xl font-bold text-green-700 capitalize mb-1">
                    {analytics.topPerformingService.name}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-green-600">
                    <div>
                      <span className="font-medium">Bookings:</span> {analytics.topPerformingService.bookingCount}
                    </div>
                    <div>
                      <span className="font-medium">Revenue:</span> {formatSimpleNPR(analytics.topPerformingService.revenue)}
                    </div>
                    <div>
                      <span className="font-medium">Completion:</span> {analytics.topPerformingService.completionRate}%
                    </div>
                    <div>
                      <span className="font-medium">Score:</span> {analytics.topPerformingService.performanceScore}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Performance Ranking */}
          {analytics?.servicePerformance && analytics.servicePerformance.length > 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Performance Ranking</h3>
              <div className="space-y-4">
                {analytics.servicePerformance.map((service, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                      index === 0 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : index === 1 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 
                            ? 'bg-green-500 text-white' 
                            : index === 1 
                            ? 'bg-blue-500 text-white'
                            : index === 2
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}>
                          #{service.rank}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 capitalize">
                            {service.serviceName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Performance Score: <span className="font-medium">{service.performanceScore}/100</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          index === 0 ? 'text-green-600' : index === 1 ? 'text-blue-600' : index === 2 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {service.bookingCount} bookings
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Revenue</p>
                        <p className="font-semibold text-gray-800">{formatSimpleNPR(service.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Completed</p>
                        <p className="font-semibold text-gray-800">{service.completedBookings}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Completion Rate</p>
                        <p className="font-semibold text-gray-800">{service.completionRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Avg Price</p>
                        <p className="font-semibold text-gray-800">{formatSimpleNPR(service.averagePrice)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Service Data Available</h3>
              <p className="text-gray-500">Start adding services and getting bookings to see performance analytics.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default VendorAnalytics