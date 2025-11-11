"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const EditService = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [serviceData, setServiceData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    images: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchServiceData()
  }, [serviceId])

  const fetchServiceData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setServiceData(data)
      } else {
        setError("Failed to fetch service data")
      }
    } catch (error) {
      console.error("Error fetching service:", error)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setServiceData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceData),
      })

      if (response.ok) {
        alert("Service updated successfully!")
        navigate("/vendor/dashboard")
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update service")
      }
    } catch (error) {
      console.error("Error updating service:", error)
      setError("Network error occurred")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Edit Service
            </h1>
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-5 py-2 rounded-xl font-semibold transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Service Title *</label>
                <input
                  type="text"
                  name="title"
                  value={serviceData.title || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={serviceData.description || ""}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={serviceData.price || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={serviceData.category || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/vendor/dashboard")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Update Service
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditService