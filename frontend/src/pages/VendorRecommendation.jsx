"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const VendorRecommendation = () => {
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userEvents, setUserEvents] = useState([])
  const [selectedEvents, setSelectedEvents] = useState([])
  const [similarityScores, setSimilarityScores] = useState({})
  const [renderError, setRenderError] = useState(null)
  const [showEventSelection, setShowEventSelection] = useState(true)
  const [analysisDetails, setAnalysisDetails] = useState(null)

  // Error boundary for component
  useEffect(() => {
    const handleError = (error) => {
      console.error("Component error:", error)
      setRenderError(error.message)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  useEffect(() => {
    fetchUserEvents()
  }, [])

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/events/my-events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserEvents(data)
        // Auto-select all events initially
        setSelectedEvents(data.map(event => event._id))
        setLoading(false)
        
        // If user has events, show selection first
        if (data.length > 0) {
          setShowEventSelection(true)
        } else {
          setShowEventSelection(false)
          setError("Create some events first to get personalized recommendations")
        }
      }
    } catch (error) {
      console.error("Error fetching user events:", error)
      setError("Failed to fetch your events")
      setLoading(false)
    }
  }

  const fetchRecommendations = async (eventIds = selectedEvents) => {
    try {
      setLoading(true)
      setError("")
      const token = localStorage.getItem("token")
      
      console.log("Fetching recommendations for events:", eventIds)
      
      if (!token) {
        setError("Please login to view recommendations")
        setLoading(false)
        return
      }

      if (!eventIds || eventIds.length === 0) {
        setError("Please select at least one event for recommendations")
        setLoading(false)
        return
      }

      const response = await fetch("/api/recommendations/jaccard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventIds }),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Recommendations data:", data)
        setRecommendations(data.recommendations || [])
        setSimilarityScores(data.similarityScores || {})
        setAnalysisDetails(data.analysisDetails || null)
        setShowEventSelection(false)
      } else {
        const errorData = await response.json()
        console.log("Error data:", errorData)
        setError(errorData.message || "Failed to fetch recommendations")
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
      setError(`Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEventToggle = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleGenerateRecommendations = () => {
    if (selectedEvents.length === 0) {
      setError("Please select at least one event")
      return
    }
    fetchRecommendations(selectedEvents)
  }

  const handleBackToSelection = () => {
    setShowEventSelection(true)
    setRecommendations([])
    setError("")
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

  const getSimilarityPercentage = (vendorId) => {
    const score = similarityScores[vendorId]
    return score ? Math.round(score * 100) : 0
  }

  const getSimilarityColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 bg-green-100"
    if (percentage >= 60) return "text-blue-600 bg-blue-100"
    if (percentage >= 40) return "text-yellow-600 bg-yellow-100"
    return "text-gray-600 bg-gray-100"
  }

  // Handle render errors
  if (renderError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Component Error</h2>
          <p className="text-gray-600 mb-4">{renderError}</p>
          <button
            onClick={() => navigate("/vendors")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Analyzing your preferences...</p>
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
                Vendor Recommendations
              </h1>
              <p className="text-gray-600 mt-1">AI-powered suggestions based on your event preferences</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchRecommendations()}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300"
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
              <button
                onClick={() => navigate("/vendors")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Browse All Vendors
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Selection Interface */}
        {showEventSelection && userEvents.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Events for Analysis</h2>
              <p className="text-gray-600 mb-4">
                Choose which events you'd like us to analyze for personalized vendor recommendations
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> Events with specific requirements (Catering, Decoration, Photography, etc.) 
                and clear locations get better vendor matches!
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {userEvents.map((event) => (
                <div
                  key={event._id}
                  className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 ${
                    selectedEvents.includes(event._id)
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                  onClick={() => handleEventToggle(event._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{event.eventType}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {event.location}
                      </div>
                      {event.requirements && event.requirements.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {event.requirements.slice(0, 2).map((req, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {req}
                              </span>
                            ))}
                            {event.requirements.length > 2 && (
                              <span className="text-xs text-gray-500">+{event.requirements.length - 2}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedEvents.includes(event._id)
                        ? "border-purple-500 bg-purple-500"
                        : "border-gray-300"
                    }`}>
                      {selectedEvents.includes(event._id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedEvents.length} of {userEvents.length} events selected
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEvents([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setSelectedEvents(userEvents.map(e => e._id))}
                  className="px-4 py-2 text-purple-600 hover:text-purple-800 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={selectedEvents.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
                >
                  Generate Recommendations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Info & Tips */}
        {!showEventSelection && (
          <div className="space-y-6 mb-8">
            {/* Algorithm Explanation */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Enhanced Jaccard Similarity Analysis</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Our AI analyzes your events using <strong>weighted Jaccard similarity</strong> to find the best vendor matches. 
                    We intelligently map event types to service needs and consider locations, requirements, and keywords.
                    <strong> Only verified vendors</strong> are included in recommendations.
                  </p>
                  {analysisDetails && (
                    <div className="bg-white/50 rounded-lg p-3 text-xs">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div><strong>Events Analyzed:</strong> {analysisDetails.eventsAnalyzed}</div>
                        <div><strong>Vendors Scanned:</strong> {analysisDetails.totalVendorsAnalyzed}</div>
                        <div><strong>Preferences Found:</strong> {analysisDetails.extractedPreferences?.length || 0}</div>
                        <div><strong>Matches Found:</strong> {recommendations.length}</div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBackToSelection}
                  className="bg-white/80 hover:bg-white text-purple-600 px-4 py-2 rounded-lg font-medium transition-all duration-300"
                >
                  Change Events
                </button>
              </div>
            </div>

            {/* Tips for Better Matches */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">💡 Tips for Better Recommendations</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">📝 When Creating Events:</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• Choose specific event types (Wedding, Birthday Party, etc.)</li>
                        <li>• Add detailed requirements (Catering, Decoration, Photography, Music, Makeup)</li>
                        <li>• Include your city/location for local vendor matches</li>
                        <li>• Use descriptive titles and descriptions</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">🎯 How Matching Works:</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Event Type:</strong> Wedding → matches catering, decoration, photography</li>
                        <li>• <strong>Requirements:</strong> Direct match with vendor service types</li>
                        <li>• <strong>Location:</strong> Matches vendors in same area</li>
                        <li>• <strong>Keywords:</strong> From event titles and descriptions</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white/60 rounded-lg">
                    <p className="text-xs text-gray-600">
                      <strong>Example:</strong> A "Wedding" event with requirements ["Catering", "Photography"] in "New York" 
                      will match vendors offering catering/photography services in New York with high similarity scores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Error Loading Recommendations</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              </div>
              <button
                onClick={fetchRecommendations}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}



        {/* Recommendations */}
        {recommendations.length === 0 && !error ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Recommendations Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create some events first to get personalized vendor recommendations based on your preferences.
            </p>
            <button
              onClick={() => navigate("/create-event")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Create Your First Event
            </button>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((vendor, index) => {
              try {
                const similarityPercentage = getSimilarityPercentage(vendor._id)
                const similarityColorClass = getSimilarityColor(similarityPercentage)
                
                return (
                  <div
                    key={vendor._id || index}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20"
                  >
                    <div className="p-6">
                      {/* Similarity Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${similarityColorClass}`}>
                          {similarityPercentage}% Match
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                          </div>
                          {vendor.featured && (
                            <div className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              Featured
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Matching Features */}
                      {vendor.matchingFeatures && vendor.matchingFeatures.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Matching preferences:</div>
                          <div className="flex flex-wrap gap-1">
                            {vendor.matchingFeatures.slice(0, 3).map((feature, idx) => (
                              <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {feature.replace(/^(type|service|location|keyword|requirement):/, '')}
                              </span>
                            ))}
                            {vendor.matchingFeatures.length > 3 && (
                              <span className="text-xs text-gray-500">+{vendor.matchingFeatures.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                        {vendor.businessName || "Unknown Vendor"}
                      </h3>

                      <div className="flex items-center mb-3">
                        <div className="flex items-center mr-2">{renderStars(vendor.rating || 4.5)}</div>
                        <span className="text-sm text-gray-600">
                          {vendor.rating || 4.5} ({vendor.reviewCount || 0} reviews)
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {vendor.description || "Professional service provider"}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{vendor.location || "Location not specified"}</span>
                        </div>

                        {vendor.priceRange && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span>
                              NPR {vendor.priceRange.min?.toLocaleString() || 0} - NPR {vendor.priceRange.max?.toLocaleString() || 0}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/vendors/${vendor._id}`)}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )
              } catch (renderError) {
                console.error("Error rendering vendor:", renderError, vendor)
                return (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">Error rendering vendor {index + 1}</p>
                  </div>
                )
              }
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default VendorRecommendation