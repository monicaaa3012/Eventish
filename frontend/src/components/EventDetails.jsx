"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import logo from "../assets/logo.png"

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
    } catch (err) {
      console.error("Error fetching event:", err)
      setError("Failed to load event details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeUntilEvent = (eventDate) => {
    const now = new Date()
    const eventDateObj = new Date(eventDate)
    const diffTime = eventDateObj - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Event has passed"
    if (diffDays === 0) return "Today!"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays <= 7) return `In ${diffDays} days`
    return `In ${diffDays} days`
  }

  const handleBack = () => navigate(-1)
  const handleEdit = () => navigate(`/events/update/${id}`)
  const handleDelete = () => navigate(`/events/delete/${id}`)

  const userRole = localStorage.getItem("role")
  const userId = localStorage.getItem("userId")
  const canEdit = event && (userRole === "admin" || event?.createdBy?._id === userId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <img src={logo} alt="Eventish Logo" className="h-12 w-auto mx-auto" />
          </div>
          <p className="text-lg text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">{event.title}</h1>
        <p className="text-center text-sm text-gray-500 mb-4">{getTimeUntilEvent(event.date)}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h2>
            <p className="font-semibold text-gray-800">{formatDate(event.date)}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Location</h2>
            <p className="font-semibold text-gray-800">{event.location}</p>
          </div>

          {/* Added Budget Section */}
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Budget</h2>
            <p className="font-semibold text-gray-800">${event.budget?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {event.description && (
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {event.createdBy && (
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-1">Organizer</h2>
            <p className="font-semibold text-gray-800">{event.createdBy.name}</p>
            <p className="text-sm text-gray-600">{event.createdBy.email}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          
          <button
            onClick={handleBack}
            className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
          >
            Back
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Event ID: {event._id}
        </p>
      </div>
    </div>
  )
}

export default EventDetails
