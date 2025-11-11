"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const UpdateVendorProfile = () => {
  const navigate = useNavigate()
  const [vendorData, setVendorData] = useState({
    name: "",
    email: "",
    businessName: "",
    companyName: "",
    phone: "",
    bio: "",
    profileImage: "",
    description: "",
    services: [],
    location: "",
    priceRange: { min: 0, max: 1000 },
    contactInfo: { phone: "", email: "", website: "" },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    console.log("UpdateVendorProfile mounted - current path:", window.location.pathname)
    fetchVendorData()
  }, [])

  const fetchVendorData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await fetch("/api/vendors/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVendorData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to fetch vendor data")
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      // Handle nested objects like priceRange.min, contactInfo.phone
      const [parent, child] = name.split(".")
      setVendorData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setVendorData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/vendors/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorData),
      })

      if (response.ok) {
        alert("Profile updated successfully!")
        navigate("/vendor/dashboard")
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Network error occurred")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Update Vendor Profile
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={vendorData.name || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-gray-700 font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={vendorData.email || ""}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl p-4 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div> */}

              <div>
                <label className="block text-gray-700 font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={vendorData.businessName || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={vendorData.companyName || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={vendorData.location || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={vendorData.contactInfo?.phone || ""}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Min Price ($)</label>
                <input
                  type="number"
                  name="priceRange.min"
                  value={vendorData.priceRange?.min || 0}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Max Price ($)</label>
                <input
                  type="number"
                  name="priceRange.max"
                  value={vendorData.priceRange?.max || 1000}
                  onChange={handleChange}
                  className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">Business Description</label>
              <textarea
                name="description"
                value={vendorData.description || ""}
                onChange={handleChange}
                rows="4"
                className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                placeholder="Describe your business and services..."
              ></textarea>
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-medium mb-2">Profile Bio</label>
              <textarea
                name="bio"
                value={vendorData.bio || ""}
                onChange={handleChange}
                rows="4"
                className="w-full bg-white/50 rounded-xl p-4 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition-all duration-200"
                placeholder="Tell clients about your experience and expertise..."
              ></textarea>
            </div>

            {/* <div className="mb-10">
              <label className="block text-gray-700 font-medium mb-2">Profile Image URL</label>
              <input
                type="text"
                name="profileImage"
                value={vendorData.profileImage || ""}
                onChange={handleChange}
                className="w-full glass-input rounded-xl p-4 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/profile.jpg"
              /> */}
              {/* {vendorData.profileImage && (
                <div className="mt-4 flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4 overflow-hidden">
                    <img
                      src={vendorData.profileImage || "/placeholder.svg"}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none"
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">Image preview</span>
                </div>
              )} */}
            {/* </div> */}

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdateVendorProfile