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
  })
  const [loading, setLoading] = useState(false)

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="brand-logo">
            <i className="fas fa-plus-circle"></i>
          </div>
          <h1 className="brand-title">Create Event</h1>
          <p className="brand-subtitle">Plan your perfect event</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label">
              <i className="fas fa-heading me-2"></i> Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control modern-input"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">
              <i className="fas fa-align-left me-2"></i> Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control modern-input"
              rows="3"
              placeholder="Describe your event..."
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">
              <i className="fas fa-calendar me-2"></i> Event Date & Time
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="form-control modern-input"
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">
              <i className="fas fa-map-marker-alt me-2"></i> Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-control modern-input"
              placeholder="Enter event location"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="modern-btn">
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <div className="spinner-border spinner-border-sm me-2" role="status" />
                Creating Event...
              </div>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>Create Event
              </>
            )}
          </button>

          <button type="button" onClick={handleBack} className="btn btn-outline-secondary w-100 mt-3">
            <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
