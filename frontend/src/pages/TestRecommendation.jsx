import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const TestRecommendation = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Simulate the API call that might be causing issues
    const testFetch = async () => {
      try {
        const token = localStorage.getItem("token")
        console.log("Testing API call with token:", token ? "exists" : "missing")
        
        const response = await fetch("/api/recommendations/jaccard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        console.log("API Response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("API Response data:", data)
        } else {
          const errorData = await response.json()
          console.log("API Error:", errorData)
          setError(`API Error: ${errorData.message || response.status}`)
        }
      } catch (error) {
        console.error("Fetch error:", error)
        setError(`Network Error: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    testFetch()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600 font-medium">Testing API connection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-4">Vendor Recommendations Test</h1>
          <p className="text-gray-600">Testing the recommendation API endpoint</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error Details:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Token:</strong> {localStorage.getItem("token") ? "Present" : "Missing"}</p>
            <p><strong>User Role:</strong> {localStorage.getItem("role") || "Not set"}</p>
            <p><strong>API Endpoint:</strong> /api/recommendations/jaccard</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/vendors")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestRecommendation