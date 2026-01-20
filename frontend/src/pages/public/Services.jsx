"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import Footer from "../../components/Footer/Footer"
import { formatSimpleNPR } from "../../utils/currency"

const Services = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [priceRange, setPriceRange] = useState("")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/services")
      
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        setServices(Array.isArray(data) ? data : [])
      } else {
        console.error("Failed to fetch services:", response.status)
        setServices([])
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (serviceId) => {
    // Allow viewing details without login
    navigate(`/services/${serviceId}`)
  }

  const handleBookingClick = (serviceId) => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    } else {
      navigate(`/services/${serviceId}`)
    }
  }

  const filteredServices = Array.isArray(services) ? services.filter(service => {
    const matchesSearch = service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Direct comparison since both are now lowercase
    const matchesCategory = !selectedCategory || service.serviceType === selectedCategory
    
    let matchesPrice = true
    if (priceRange) {
      const price = service.price || 0
      switch (priceRange) {
        case "0-10000":
          matchesPrice = price <= 10000
          break
        case "10000-50000":
          matchesPrice = price > 10000 && price <= 50000
          break
        case "50000-100000":
          matchesPrice = price > 50000 && price <= 100000
          break
        case "100000+":
          matchesPrice = price > 100000
          break
        default:
          matchesPrice = true
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice
  }) : []

  // Use lowercase to match database enum values
  const serviceCategories = ["catering", "decoration", "photography", "music", "makeup"]
  
  // Display names for categories (capitalized for UI)
  const categoryDisplayNames = {
    catering: "Catering",
    decoration: "Decoration", 
    photography: "Photography",
    music: "Music",
    makeup: "Makeup"
  }

  const categoryIcons = {
    catering: "🍽️",
    decoration: "🎨",
    photography: "📸",
    music: "🎵",
    makeup: "💄"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Professional Event Services</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Discover a wide range of professional services for your events. From catering to photography, 
            find the perfect service providers to make your event memorable.
          </p>
        </div>
      </div>

      {/* Service Categories Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Service Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {serviceCategories.map((category) => {
            const categoryCount = Array.isArray(services) ? services.filter(s => s.serviceType === category).length : 0
            
            return (
              <div
                key={category}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 cursor-pointer ${
                  selectedCategory === category ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => {
                  const newCategory = selectedCategory === category ? "" : category
                  setSelectedCategory(newCategory)
                }}
              >
                <div className="text-4xl mb-4">{categoryIcons[category]}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{categoryDisplayNames[category]}</h3>
                <p className="text-sm text-gray-600">
                  {categoryCount} services available
                </p>
              </div>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
              <input
                type="text"
                placeholder="Search by description or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {serviceCategories.map(category => (
                  <option key={category} value={category}>{categoryDisplayNames[category]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Prices</option>
                <option value="0-10000">Under NPR 10,000</option>
                <option value="10000-50000">NPR 10,000 - 50,000</option>
                <option value="50000-100000">NPR 50,000 - 100,000</option>
                <option value="100000+">Above NPR 100,000</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("")
                  setPriceRange("")
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {filteredServices.length} Service{filteredServices.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service._id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 overflow-hidden"
                >
                  {/* Service Image */}
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-blue-400 relative overflow-hidden">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0].startsWith('http') ? service.images[0] : `http://localhost:5000/${service.images[0]}`}
                        alt={service.serviceType}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-6xl">{categoryIcons[service.serviceType] || "🎉"}</div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {categoryDisplayNames[service.serviceType] || service.serviceType}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 hover:text-purple-600 transition-colors">
                        {categoryDisplayNames[service.serviceType] || service.serviceType} Service
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatSimpleNPR(service.price || 0)}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {service.description || "Professional service for your event"}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        By {service.vendorId?.businessName || "Professional Vendor"}
                      </div>
                      
                      {service.vendorId?.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {service.vendorId.location}
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Added {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(service._id)}
                        className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleBookingClick(service._id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No services found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or clear the filters.</p>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Professional Event Services?</h2>
          <p className="text-lg mb-6">Connect with top-rated service providers and make your event extraordinary.</p>
          <Link
            to="/register"
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            Start Planning Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Services