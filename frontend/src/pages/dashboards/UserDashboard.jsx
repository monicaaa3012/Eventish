"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const UserDashboard = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

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
        setEvents(data)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setEvents(events.filter((event) => event._id !== eventId))
        alert("Event deleted successfully")
      } else {
        alert("Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Error deleting event")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
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

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-gradient mb-0">
            <i className="fas fa-user me-2"></i>My Dashboard
          </h2>
          <p className="text-muted">Manage your events and bookings</p>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-4 text-primary mb-2">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h5 className="card-title">Create Event</h5>
              <p className="card-text text-muted">Plan a new event</p>
              <button className="btn btn-primary" onClick={() => navigate("/create-event")}>
                Get Started
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-4 text-success mb-2">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h5 className="card-title">My Events</h5>
              <p className="card-text text-muted">{events.length} events created</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-4 text-info mb-2">
                <i className="fas fa-search"></i>
              </div>
              <h5 className="card-title">Find Vendors</h5>
              <p className="card-text text-muted">Coming soon</p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="display-4 text-warning mb-2">
                <i className="fas fa-handshake"></i>
              </div>
              <h5 className="card-title">Bookings</h5>
              <p className="card-text text-muted">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>My Events
          </h5>
        </div>
        <div className="card-body">
          {events.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-calendar-times display-1 text-muted mb-3"></i>
              <h4 className="text-muted">No events yet</h4>
              <p className="text-muted mb-4">Create your first event to get started</p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate("/create-event")}>
                <i className="fas fa-plus me-2"></i>Create Your First Event
              </button>
            </div>
          ) : (
            <div className="row">
              {events.map((event) => (
                <div key={event._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title">{event.title}</h5>
                      {event.description && (
                        <p className="card-text text-muted">
                          {event.description.length > 100
                            ? `${event.description.substring(0, 100)}...`
                            : event.description}
                        </p>
                      )}
                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="fas fa-calendar me-1"></i>
                          {formatDate(event.date)}
                        </small>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {event.location}
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-info flex-fill"
                          onClick={() => navigate(`/events/${event._id}`)}
                        >
                          <i className="fas fa-eye me-1"></i>View
                        </button>
                       
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEvent(event._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
