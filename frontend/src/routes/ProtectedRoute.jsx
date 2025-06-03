"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation()
  const [isAuthorized, setIsAuthorized] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const userRole = localStorage.getItem("role")

      console.log("ProtectedRoute check:", {
        path: location.pathname,
        token: token ? "exists" : "missing",
        userRole,
        allowedRoles,
        hasValidRole: allowedRoles.includes(userRole),
      })

      // Check if user is authenticated
      if (!token) {
        console.log("No token found, redirecting to login")
        setIsAuthorized(false)
        return
      }

      // Check if user has required role
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        console.log("Role not allowed:", { userRole, allowedRoles })
        setIsAuthorized("unauthorized")
        return
      }

      console.log("Access granted")
      setIsAuthorized(true)
    }

    checkAuth()
    setIsLoading(false)
  }, [location.pathname, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (isAuthorized === false) {
    return <Navigate to="/login" replace />
  }

  if (isAuthorized === "unauthorized") {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
