"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const EditService = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [serviceData, setServiceData] = useState({
    description: "",
    price: "",
    serviceType: "",
    images: []
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchServiceData()
  }, [serviceId])

  const fetchServiceData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/services/${serviceId}`, {
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
    setSuccess("")
    setUpdating(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: serviceData.description,
          price: serviceData.price,
          serviceType: serviceData.serviceType
        }),
      })

      if (response.ok) {
        setSuccess("Service updated successfully!")
        // Trigger a custom event to notify dashboard to refresh
        window.dispatchEvent(new Event('serviceUpdated'))
        setTimeout(() => {
          navigate("/vendor/dashboard")
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || errorData.message || "Failed to update service")
      }
    } catch (error) {
      console.error("Error updating service:", error)
      setError("Network error occurred")
    } finally {
      setUpdating(false)
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
            <div>
              <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Edit Service
              </h1>
              {serviceData.serviceType && (
                <p className="text-gray-600 mt-2">
                  Current: <span className="font-semibold">{serviceData.serviceType.charAt(0).toUpperCase() + serviceData.serviceType.slice(1)} Service</span>
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white px-5 py-2 rounded-xl font-semibold transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Service Category *</label>
                <select
                  name="serviceType"
                  value={serviceData.serviceType || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                  required
                >
                  <option value="">Choose a service category</option>
                  <option value="catering">Catering</option>
                  <option value="decoration">Decoration</option>
                  <option value="photography">Photography</option>
                  <option value="music">Music</option>
                  <option value="makeup">Makeup</option>
                </select>
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
                <label className="block text-gray-700 font-medium mb-2">Price (NPR) *</label>
                <input
                  type="number"
                  name="price"
                  value={serviceData.price || ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
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
                  disabled={updating}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:transform-none"
                >
                  {updating ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    "Update Service"
                  )}
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