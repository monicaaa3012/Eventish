"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const VendorBrowse = () => {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    service: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    sortBy: "rating",
    sortOrder: "desc",
  })
  // Define service categories
  const serviceCategories = [
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "makeup", label: "Makeup" }
  ]
  const [locations, setLocations] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })


  useEffect(() => {
    fetchVendors()
    fetchLocations()
  }, [filters])

  // Initial load effect
  useEffect(() => {
    fetchVendors(1)
  }, [])



  // Fetch Vendors
  const fetchVendors = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: "12",
      })

      Object.keys(filters).forEach((key) => {
        if (!filters[key]) queryParams.delete(key)
      })

      const response = await fetch(`/api/vendors?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setVendors(data.vendors)
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
        })

      } else {
        console.error("Failed to fetch vendors:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    } finally {
      setLoading(false)
    }
  }



  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/vendors/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      service: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      sortBy: "rating",
      sortOrder: "desc",
    })
  }

  const handlePageChange = (page) => {
    fetchVendors(page)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">Find Perfect Vendors</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with trusted service providers for your events
            </p>
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Back
            </button>
            <button
              onClick={() => {
                console.log("Navigating to vendor-recommendations")
                console.log("Current user role:", localStorage.getItem("role"))
                console.log("Current token:", localStorage.getItem("token") ? "exists" : "missing")
                navigate("/vendor-recommendations")
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              View Recommendations
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <select
                value={filters.service}
                onChange={(e) => handleFilterChange("service", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Services</option>
                {serviceCategories.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                placeholder="$10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-")
                  handleFilterChange("sortBy", sortBy)
                  handleFilterChange("sortOrder", sortOrder)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="priceRange.min-asc">Price: Low to High</option>
                <option value="priceRange.min-desc">Price: High to Low</option>
                <option value="createdAt-desc">Newest First</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                Showing {vendors.length} of {pagination.total} vendors
              </p>
              {Object.values(filters).some(filter => filter) && (
                <p className="text-xs text-purple-600 mt-1">
                  Filters active: {Object.entries(filters).filter(([key, value]) => value).map(([key, value]) => {
                    if (key === 'service') {
                      const serviceLabel = serviceCategories.find(s => s.value === value)?.label || value
                      return `${key}: ${serviceLabel}`
                    }
                    return `${key}: ${value}`
                  }).join(', ')}
                </p>
              )}
            </div>
            <button onClick={clearFilters} className="text-purple-600 hover:text-purple-800 font-medium text-sm">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No vendors found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(filter => filter) 
                ? "Try adjusting your filters to find more vendors." 
                : "No vendors have completed their profiles yet."}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Total vendors in database: {pagination.total}
            </p>
            <div className="space-x-4">
              <button
                onClick={clearFilters}
                className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => fetchVendors(1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {vendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                          {vendor.businessName || vendor.userId?.name || "Unnamed Vendor"}
                        </h3>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-2">{renderStars(vendor.rating)}</div>
                          <span className="text-sm text-gray-600">
                            {vendor.rating} ({vendor.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                      {vendor.featured && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full font-medium">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {vendor.description || "Professional service provider"}
                      {(!vendor.description || vendor.businessName === "My Business") && (
                        <span className="text-sm text-orange-600 block mt-1 italic">
                          Profile setup in progress
                        </span>
                      )}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span>{vendor.location || "Location not specified"}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        <span>
                          ${vendor.priceRange?.min?.toLocaleString() || "0"} - ${vendor.priceRange?.max?.toLocaleString() || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.services && vendor.services.length > 0 ? (
                        <>
                          {vendor.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium"
                            >
                              {service}
                            </span>
                          ))}
                          {vendor.services.length > 3 && (
                            <span className="text-xs text-gray-500">+{vendor.services.length - 3} more</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No services listed yet</span>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/vendors/${vendor._id}`)}
                      className="w-full bg-primary-gradient text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      page === pagination.currentPage
                        ? "bg-primary-gradient text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default VendorBrowse