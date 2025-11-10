"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

const ServiceDetails = () => {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await fetch(`/api/services/${serviceId}`)
        if (response.ok) {
          const serviceData = await response.json()
          setService(serviceData)

          // Fetch vendor details
          if (serviceData.createdBy) {
            const vendorResponse = await fetch(`/api/vendors/user/${serviceData.createdBy._id}`)
            if (vendorResponse.ok) {
              const vendorData = await vendorResponse.json()
              setVendor(vendorData)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching service details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceDetails()
  }, [serviceId])

  const nextImage = () => {
    if (service?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % service.images.length)
    }
  }

  const prevImage = () => {
    if (service?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + service.images.length) % service.images.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Service not found</h1>
          <button onClick={() => navigate(-1)} className="bg-primary-gradient text-white px-6 py-3 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="mb-6 text-purple-600 hover:underline">
          &larr; Back
        </button>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/20">
          {/* Service Image */}
          {service.images && service.images.length > 0 && (
            <div className="relative mb-6">
              <img
                src={`/uploads/${service.images[currentImageIndex]}`}
                alt="Service"
                className="w-full rounded-xl object-cover aspect-video"
              />
              {service.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full text-white"
                  >
                    &#8594;
                  </button>
                </>
              )}
            </div>
          )}

          {/* Service Info */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{service.title || "Service Details"}</h1>
          <p className="text-gray-600 mb-4 whitespace-pre-line">{service.description}</p>
          <div className="text-purple-600 font-semibold text-xl mb-2">${service.price}</div>
          <div className="text-gray-500 text-sm mb-8">Added on {new Date(service.createdAt).toLocaleDateString()}</div>

          {/* Vendor Info */}
          {vendor && (
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-2">About the Vendor</h2>
              <p className="text-lg font-semibold">{vendor.businessName}</p>
              <p className="text-gray-600">{vendor.description}</p>
              <p className="text-sm mt-2 text-gray-500">Location: {vendor.location}</p>
              <p className="text-sm text-yellow-600">Rating: {vendor.rating} ⭐</p>
              <button
                onClick={() => navigate(`/vendors/${vendor._id}`)}
                className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                View Vendor Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceDetails
