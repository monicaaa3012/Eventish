"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { SERVICE_CATEGORIES, getPopularCategories, EVENT_SERVICE_MAPPING } from "../../utils/serviceCategories"

const CreateEvent = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    budget: "",
    eventType: "",
    requirements: [],
  })

  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showAllServices, setShowAllServices] = useState(false)

  // Get popular services for initial display, all services when expanded
  const popularServices = getPopularCategories()
  const displayServices = showAllServices ? SERVICE_CATEGORIES : popularServices

  const eventTypeOptions = [
    "Wedding",
    "Birthday Party",
    "Corporate Event",
    "Anniversary",
    "Baby Shower",
    "Graduation",
    "Holiday Party",
    "Conference",
    "Workshop",
    "Other"
  ]

  const toggleRequirement = (serviceValue) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(serviceValue)
        ? prev.requirements.filter((item) => item !== serviceValue)
        : [...prev.requirements, serviceValue],
    }))
  }

  // Auto-suggest services based on event type
  const handleEventTypeChange = (e) => {
    const eventType = e.target.value
    setFormData(prev => ({ ...prev, eventType }))
    
    // Auto-suggest relevant services
    if (EVENT_SERVICE_MAPPING[eventType]) {
      setFormData(prev => ({
        ...prev,
        requirements: EVENT_SERVICE_MAPPING[eventType]
      }))
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await response.json()
        alert("Event created successfully!")
        navigate("/user/dashboard")
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to create event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate("/user/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply blur-xl opacity-70 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-white/20">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Create Event
          </h1>
          <p className="text-gray-600">Plan your perfect event experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TITLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* EVENT TYPE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Type
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleEventTypeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80"
              required
            >
              <option value="">Select event type</option>
              {eventTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80 resize-none"
              placeholder="Describe your event..."
            />
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Date & Time
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80"
              required
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80"
              placeholder="Enter event location"
              required
            />
          </div>

          {/* BUDGET */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Budget
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white/80"
              placeholder="Enter event budget"
              required
            />
          </div>

          {/* SERVICE REQUIREMENTS */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Service Requirements
              <span className="text-xs text-gray-500 ml-2">
                ({formData.requirements.length} selected)
              </span>
            </label>

            <div
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 cursor-pointer flex items-center justify-between min-h-[48px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex-1">
                {formData.requirements.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {formData.requirements.slice(0, 3).map((req) => {
                      const category = SERVICE_CATEGORIES.find(cat => cat.value === req)
                      return (
                        <span key={req} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                          {category?.icon} {category?.label || req}
                        </span>
                      )
                    })}
                    {formData.requirements.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{formData.requirements.length - 3} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">Select services you need</span>
                )}
              </div>
              <span className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>

            {dropdownOpen && (
              <div className="absolute mt-2 w-full bg-white shadow-xl rounded-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {showAllServices ? 'All Services' : 'Popular Services'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAllServices(!showAllServices)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {showAllServices ? 'Show Less' : `Show All (${SERVICE_CATEGORIES.length})`}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1">
                    {displayServices.map((service) => (
                      <label
                        key={service.value}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-purple-50 rounded-lg cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={formData.requirements.includes(service.value)}
                          onChange={() => toggleRequirement(service.value)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-lg">{service.icon}</span>
                        <div className="flex-1">
                          <span className="text-gray-700 font-medium">{service.label}</span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-600">
                            {service.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {formData.requirements.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, requirements: [] }))}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Clear All Selections
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 rounded-xl hover:scale-105 shadow-lg"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl"
            >
              Back to Dashboard
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateEvent
