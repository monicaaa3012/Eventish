"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventsThisMonth: 0,
    topEventCreators: [],
  })
  const [events, setEvents] = useState([])
  const [pendingVendors, setPendingVendors] = useState([])
  const [allVendors, setAllVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem("role")
    if (userRole !== "admin") {
      alert("Admin access required")
      navigate("/login")
      return
    }
    
    fetchStats()
    fetchAllEvents()
    fetchPendingVendors()
    fetchAllVendors()
  }, [navigate])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/events/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/events/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingVendors = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/vendors/admin/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPendingVendors(data.vendors)
      } else {
        console.error("Failed to fetch pending vendors")
      }
    } catch (error) {
      console.error("Error fetching pending vendors:", error)
    }
  }

  const fetchAllVendors = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/vendors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAllVendors(data.vendors)
      }
    } catch (error) {
      console.error("Error fetching all vendors:", error)
    }
  }

  const handleVerifyVendor = async (vendorId, verified) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/vendors/admin/verify/${vendorId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified }),
      })

      if (response.ok) {
        alert(`Vendor ${verified ? 'verified' : 'rejected'} successfully!`)
        fetchPendingVendors()
        fetchAllVendors()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update vendor")
      }
    } catch (error) {
      console.error("Error updating vendor:", error)
      alert("Network error occurred")
    }
  }

  const handleFeatureVendor = async (vendorId, featured) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/vendors/admin/feature/${vendorId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ featured }),
      })

      if (response.ok) {
        alert(`Vendor ${featured ? 'featured' : 'unfeatured'} successfully!`)
        fetchAllVendors()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to update vendor")
      }
    } catch (error) {
      console.error("Error updating vendor:", error)
      alert("Network error occurred")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/")
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

  const renderVendorCard = (vendor, isPending = false) => (
    <div key={vendor._id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {vendor.businessName || "Unnamed Business"}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Owner:</strong> {vendor.userId?.name} ({vendor.userId?.email})
          </p>
          <p className="text-sm text-gray-600 mb-1">
            <strong>Location:</strong> {vendor.location || "Not specified"}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            <strong>Member Since:</strong> {new Date(vendor.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            vendor.verified 
              ? "bg-green-100 text-green-800" 
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {vendor.verified ? "Verified" : "Pending"}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            vendor.featured 
              ? "bg-purple-100 text-purple-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {vendor.featured ? "Featured" : "Standard"}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 text-sm">
          {vendor.description || "No description provided"}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          <strong>Price Range:</strong> ${vendor.priceRange?.min || 0} - ${vendor.priceRange?.max || 0}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Rating:</strong> {vendor.rating || 0}/5 ({vendor.reviewCount || 0} reviews)
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {isPending ? (
          <>
            <button
              onClick={() => handleVerifyVendor(vendor._id, true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Accept
            </button>
            <button
              onClick={() => handleVerifyVendor(vendor._id, false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleVerifyVendor(vendor._id, !vendor.verified)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vendor.verified
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {vendor.verified ? "Unverify" : "Verify"}
            </button>
            <button
              onClick={() => handleFeatureVendor(vendor._id, !vendor.featured)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vendor.featured
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {vendor.featured ? "Unfeature" : "Feature"}
            </button>
          </>
        )}
        <button
          onClick={() => navigate(`/vendors/${vendor._id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage events, vendors, and monitor system activity</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Overview & Events
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending Vendors ({pendingVendors.length})
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === "vendors"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Vendors ({allVendors.length})
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.eventsThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.topEventCreators.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{pendingVendors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{allVendors.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.slice(0, 10).map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-500">{event.description?.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.createdBy?.name}</div>
                      <div className="text-sm text-gray-500">{event.createdBy?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(event.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* Pending Vendors Tab */}
        {activeTab === "pending" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Vendor Verification</h2>
              <p className="text-gray-600">Review and approve vendor applications</p>
            </div>
            {pendingVendors.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">All Caught Up!</h3>
                <p className="text-gray-600">No vendors pending verification at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingVendors.map(vendor => renderVendorCard(vendor, true))}
              </div>
            )}
          </div>
        )}

        {/* All Vendors Tab */}
        {activeTab === "vendors" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Vendors</h2>
              <p className="text-gray-600">Manage vendor verification and featured status</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {allVendors.map(vendor => renderVendorCard(vendor, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
