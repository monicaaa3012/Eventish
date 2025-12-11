"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const CreateEvent = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    budget: "",
    requirements: [],
  })

  const [loading, setLoading] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const options = [
    "Catering",
    "Decoration",
    "Photography",
    "Music",
    "Makeup",
  ]

  const toggleRequirement = (req) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.includes(req)
        ? prev.requirements.filter((item) => item !== req)
        : [...prev.requirements, req],
    }))
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

          {/* CUSTOM MULTI-SELECT */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Requirements
            </label>

            <div
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 cursor-pointer flex items-center justify-between"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="text-gray-600">
                {formData.requirements.length > 0
                  ? formData.requirements.join(", ")
                  : "Select requirements"}
              </span>
              <span>▼</span>
            </div>

            {dropdownOpen && (
              <div className="absolute mt-2 w-full bg-white shadow-lg rounded-xl border p-3 z-20">
                {options.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 px-2 py-2 hover:bg-purple-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.requirements.includes(opt)}
                      onChange={() => toggleRequirement(opt)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
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
