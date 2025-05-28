"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${id}`)

      if (response.ok) {
        const data = await response.json()
        setEvent(data)
      } else {
        setError("Event not found")
      }
    } catch (error) {
      console.error("Error fetching event:", error)
      setError("Failed to load event details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getTimeUntilEvent = (eventDate) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diffTime = event - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: "Event has passed", color: "text-danger", icon: "fas fa-clock" }
    } else if (diffDays === 0) {
      return { text: "Today!", color: "text-success", icon: "fas fa-star" }
    } else if (diffDays === 1) {
      return { text: "Tomorrow", color: "text-warning", icon: "fas fa-calendar-day" }
    } else if (diffDays <= 7) {
      return { text: `In ${diffDays} days`, color: "text-info", icon: "fas fa-calendar-week" }
    } else {
      return { text: `In ${diffDays} days`, color: "text-primary", icon: "fas fa-calendar" }
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleEdit = () => {
    navigate(`/events/update/${id}`)
  }

  const handleDelete = () => {
    navigate(`/events/delete/${id}`)
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="brand-logo">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h1 className="brand-title">Loading...</h1>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="brand-logo bg-danger">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1 className="brand-title text-danger">Error</h1>
          <p className="brand-subtitle">{error}</p>
          <button className="modern-btn" onClick={handleBack}>
            <i className="fas fa-arrow-left me-2"></i>Go Back
          </button>
        </div>
      </div>
    )
  }

  const timeInfo = getTimeUntilEvent(event.date)
  const userRole = localStorage.getItem("role")
  const userId = localStorage.getItem("userId")
  const canEdit = userRole === "admin" || (event.createdBy && event.createdBy._id === userId)

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "800px", width: "95%" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="brand-logo">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h1 className="brand-title">{event.title}</h1>
          <p className="brand-subtitle">Event Details</p>
        </div>

        {/* Event Status */}
        <div className="text-center mb-4">
          <div className={`badge fs-6 px-4 py-2 ${timeInfo.color.replace("text-", "bg-")}`}>
            <i className={`${timeInfo.icon} me-2`}></i>
            {timeInfo.text}
          </div>
        </div>

        {/* Event Information */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-4 text-primary mb-2">
                  <i className="fas fa-calendar"></i>
                </div>
                <h6 className="card-title text-muted">Date & Time</h6>
                <p className="card-text fw-bold">{formatDate(event.date)}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-4 text-success mb-2">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h6 className="card-title text-muted">Location</h6>
                <p className="card-text fw-bold">{event.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h6 className="mb-0">
                <i className="fas fa-align-left me-2 text-info"></i>Description
              </h6>
            </div>
            <div className="card-body">
              <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                {event.description}
              </p>
            </div>
          </div>
        )}

        {/* Event Organizer */}
        {event.createdBy && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h6 className="mb-0">
                <i className="fas fa-user me-2 text-warning"></i>Event Organizer
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="brand-logo me-3" style={{ width: "50px", height: "50px" }}>
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <h6 className="mb-1 fw-bold">{event.createdBy.name}</h6>
                  <p className="text-muted mb-0">{event.createdBy.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event Metadata */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-info mb-2">
                  <i className="fas fa-plus-circle fa-2x"></i>
                </div>
                <h6 className="card-title text-muted">Created On</h6>
                <p className="card-text fw-bold">{formatDateShort(event.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="text-secondary mb-2">
                  <i className="fas fa-edit fa-2x"></i>
                </div>
                <h6 className="card-title text-muted">Last Updated</h6>
                <p className="card-text fw-bold">{formatDateShort(event.updatedAt || event.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          {canEdit && (
            <div className="row mb-3">
              <div className="col-md-6 mb-2">
                <button className="btn btn-outline-primary w-100" onClick={handleEdit}>
                  <i className="fas fa-edit me-2"></i>Edit Event
                </button>
              </div>
              <div className="col-md-6 mb-2">
                <button className="btn btn-outline-danger w-100" onClick={handleDelete}>
                  <i className="fas fa-trash me-2"></i>Delete Event
                </button>
              </div>
            </div>
          )}

          <button className="modern-btn" onClick={handleBack}>
            <i className="fas fa-arrow-left me-2"></i>Back
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-4">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Event ID: {event._id}
          </small>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
