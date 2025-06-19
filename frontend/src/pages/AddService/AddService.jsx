"use client"

import { useState } from "react"
import uploadarea from "../../assets/upload.png"
import { useNavigate } from "react-router-dom"

const AddService = () => {
  const navigate = useNavigate()
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    console.log("Selected files:", files.length) // Debug log

    if (files.length === 0) return

    if (files.length > 4) {
      setError("You can only upload up to 4 images")
      return
    }

    // Clear previous error
    setError("")

    // Set the new images
    setImages(files)

    // Create preview URLs for all selected images
    const previews = files.map((file) => {
      console.log("Creating preview for:", file.name) // Debug log
      return URL.createObjectURL(file)
    })

    // Clean up old previews
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))

    setImagePreviews(previews)
    console.log("Total previews created:", previews.length) // Debug log
  }

  const handleAddMoreImages = (e) => {
    const newFiles = Array.from(e.target.files)
    console.log("Adding more files:", newFiles.length) // Debug log

    if (newFiles.length === 0) return

    const totalFiles = images.length + newFiles.length
    if (totalFiles > 4) {
      setError(`You can only upload up to 4 images total. You currently have ${images.length} images.`)
      return
    }

    setError("")

    // Combine existing and new images
    const combinedImages = [...images, ...newFiles]
    setImages(combinedImages)

    // Create previews for new images
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    const combinedPreviews = [...imagePreviews, ...newPreviews]
    setImagePreviews(combinedPreviews)

    console.log("Total images after adding:", combinedImages.length) // Debug log
  }

  const removeImage = (index) => {
    console.log("Removing image at index:", index) // Debug log

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])

    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    setImages(newImages)
    setImagePreviews(newPreviews)

    // Clear error if we're now under the limit
    if (newImages.length <= 4) {
      setError("")
    }

    console.log("Images after removal:", newImages.length) // Debug log
  }

  const clearAllImages = () => {
    // Clean up all preview URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))

    setImages([])
    setImagePreviews([])
    setError("")

    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]')
    fileInputs.forEach((input) => (input.value = ""))

    console.log("All images cleared") // Debug log
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    console.log("Submitting with images:", images.length) // Debug log

    if (images.length === 0 || !description || !price) {
      setError("Please fill out all fields and upload at least one image.")
      setLoading(false)
      return
    }

    const formData = new FormData()

    // Add each image to FormData
    images.forEach((image, index) => {
      console.log(`Adding image ${index + 1}:`, image.name) // Debug log
      formData.append("images", image)
    })

    formData.append("description", description)
    formData.append("price", price)

    // Debug: Log FormData contents
    console.log("FormData contents:")
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1])
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/services/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add service")
      }

      setSuccess("Service added successfully!")

      // Clean up preview URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))

      setImages([])
      setImagePreviews([])
      setDescription("")
      setPrice("")

      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach((input) => (input.value = ""))

      // Redirect after success
      setTimeout(() => {
        navigate("/vendor/dashboard")
      }, 2000)
    } catch (error) {
      console.error("Error adding service:", error)
      setError(error.message || "Failed to add service")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Clean up preview URLs before navigating
    imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    navigate("/vendor/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Add New Service</h1>
            <p className="text-gray-600">Showcase your services to potential clients</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Images Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-gray-700">Upload Images ({images.length}/4)</label>
                {images.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Main Upload Area */}
              <div className="mb-4">
                <label htmlFor="main-image-input" className="cursor-pointer block">
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-indigo-500 transition-colors hover:bg-indigo-50 group">
                    <img
                      src={uploadarea || "/placeholder.svg"}
                      alt="Upload"
                      className="w-12 h-12 opacity-60 group-hover:opacity-80 mb-2"
                    />
                    <p className="text-gray-500 text-sm text-center">
                      {images.length === 0 ? "Click to select up to 4 images" : "Click to add more images"}
                      <br />
                      <span className="text-xs">PNG, JPG, JPEG up to 5MB each</span>
                    </p>
                  </div>
                </label>
                <input
                  type="file"
                  id="main-image-input"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={images.length === 0 ? handleImageChange : handleAddMoreImages}
                />
              </div>

              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Selected Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                          title="Remove image"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}

                    {/* Show remaining slots */}
                    {Array.from({ length: 4 - imagePreviews.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <span className="text-gray-400 text-xs">Empty</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                Service Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Explain about your services in detail..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 resize-none"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-3">
                Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="w-full bg-primary-gradient text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding Service...
                  </div>
                ) : (
                  `Add Service (${images.length} image${images.length !== 1 ? "s" : ""})`
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddService
