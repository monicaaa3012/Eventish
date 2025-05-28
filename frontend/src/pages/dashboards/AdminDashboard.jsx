"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventsThisMonth: 0,
    topEventCreators: [],
  })
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchStats()
    fetchAllEvents()
  }, [])

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
        fetchStats() // Refresh stats
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
      <div className="auth-container">
        <div className="auth-card text-center">
          <div className="brand-logo">
            <i className="fas fa-crown"></i>
          </div>
          <h1 className="brand-title">Loading...</h1>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "1200px", width: "95%" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="brand-logo">
            <i className="fas fa-crown"></i>
          </div>
          <h1 className="brand-title">Admin Dashboard</h1>
          <p className="brand-subtitle">Manage events and monitor platform activity</p>
          <button className="btn btn-outline-danger btn-sm mt-2" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-switcher mb-4">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <i className="fas fa-chart-pie me-2"></i>Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            <i className="fas fa-calendar-alt me-2"></i>Events ({events.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <i className="fas fa-analytics me-2"></i>Analytics
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="display-4 text-primary mb-2">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <h4 className="fw-bold">{stats.totalEvents}</h4>
                    <p className="text-muted mb-0">Total Events</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="display-4 text-success mb-2">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <h4 className="fw-bold">{stats.eventsThisMonth}</h4>
                    <p className="text-muted mb-0">This Month</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="display-4 text-info mb-2">
                      <i className="fas fa-users"></i>
                    </div>
                    <h4 className="fw-bold">{stats.topEventCreators.length}</h4>
                    <p className="text-muted mb-0">Active Users</p>
                  </div>
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="display-4 text-warning mb-2">
                      <i className="fas fa-percentage"></i>
                    </div>
                    <h4 className="fw-bold">
                      {stats.totalEvents > 0 ? Math.round((stats.eventsThisMonth / stats.totalEvents) * 100) : 0}%
                    </h4>
                    <p className="text-muted mb-0">Growth Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2"></i>Recent Events
                </h5>
              </div>
              <div className="card-body">
                {events.slice(0, 5).map((event) => (
                  <div key={event._id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <h6 className="mb-1">{event.title}</h6>
                      <small className="text-muted">
                        by {event.createdBy?.name} • {formatDate(event.date)}
                      </small>
                    </div>
                    <span className="badge bg-primary">{event.location}</span>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-times display-4 text-muted mb-3"></i>
                    <p className="text-muted">No events found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>All Events Management
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Creator</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event._id}>
                        <td>
                          <strong>{event.title}</strong>
                          {event.description && (
                            <React.Fragment>
                              <br />
                              <small className="text-muted">{event.description.substring(0, 50)}...</small>
                            </React.Fragment>
                          )}
                        </td>
                        <td>
                          <div>
                            <strong>{event.createdBy?.name}</strong>
                            <br />
                            <small className="text-muted">{event.createdBy?.email}</small>
                          </div>
                        </td>
                        <td>{formatDate(event.date)}</td>
                        <td>
                          <span className="badge bg-secondary">{event.location}</span>
                        </td>
                        <td>{formatDate(event.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteEvent(event._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {events.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-times display-4 text-muted mb-3"></i>
                    <p className="text-muted">No events found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="row">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-trophy me-2"></i>Top Event Creators
                  </h5>
                </div>
                <div className="card-body">
                  {stats.topEventCreators.map((creator, index) => (
                    <div
                      key={creator._id}
                      className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    >
                      <div className="d-flex align-items-center">
                        <span className="badge bg-primary me-3">#{index + 1}</span>
                        <div>
                          <strong>{creator.userName}</strong>
                          <br />
                          <small className="text-muted">{creator.userEmail}</small>
                        </div>
                      </div>
                      <span className="badge bg-success">{creator.eventCount} events</span>
                    </div>
                  ))}
                  {stats.topEventCreators.length === 0 && (
                    <div className="text-center py-4">
                      <i className="fas fa-chart-bar display-4 text-muted mb-3"></i>
                      <p className="text-muted">No data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-pie me-2"></i>Platform Statistics
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-6 mb-3">
                      <div className="border rounded p-3">
                        <h4 className="text-primary">{stats.totalEvents}</h4>
                        <small className="text-muted">Total Events</small>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="border rounded p-3">
                        <h4 className="text-success">{stats.eventsThisMonth}</h4>
                        <small className="text-muted">This Month</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h4 className="text-info">{stats.topEventCreators.length}</h4>
                        <small className="text-muted">Active Creators</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h4 className="text-warning">
                          {stats.totalEvents > 0 ? Math.round((stats.eventsThisMonth / stats.totalEvents) * 100) : 0}%
                        </h4>
                        <small className="text-muted">Monthly Growth</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
