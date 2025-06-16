import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import UserDashboard from "./pages/dashboard/UserDashboard"
import VendorDashboard from "./pages/dashboard/VendorDashboard"
import AdminDashboard from "./pages/dashboard/AdminDashboard"
import CreateEvent from "./pages/events/CreateEvent"
import EventDetails from "./components/EventDetails"
import GeneralDashboard from "./pages/dashboard/GeneralDashboard"
import Unauthorized from "./components/Unauthorized"
import ProtectedRoute from "./routes/ProtectedRoute"
import VendorBrowse from "./pages/Vendor/VendorBrowse"
import VendorDetails from "./pages/Vendor/VendorDetails"
import UpdateVendorProfile from "./pages/Vendor/UpdateVendorProfile"
import VendorProfile from "./pages/Vendor/VendorProfile"


const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<GeneralDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          {/* Vendor Profile Routes */}
          <Route
            path="/vendor/profile"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorProfile />
              </ProtectedRoute>
            }
          />
          // Update Vendor Profile Route
          <Route
            path="/vendor/update-profile"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <UpdateVendorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                <EventDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors"
            element={
              <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                <VendorBrowse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors/:id"
            element={
              <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                <VendorDetails />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        

        
      </div>
    </Router>
  )
}

export default App
