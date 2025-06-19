"use client"

import { useNavigate } from "react-router-dom"

const Unauthorized = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate("/")
  }

  const handleLogin = () => {
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>

        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. Please check your credentials or contact an administrator.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition"
          >
            Go Back
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition"
          >
            Home
          </button>

          <button
            onClick={handleLogin}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
