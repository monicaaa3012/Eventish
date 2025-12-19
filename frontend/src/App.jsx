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
import BookingManagement from "./pages/bookings/BookingManagement"
import AddService from "./pages/Vendor/AddService/AddService"
import ManageBooking from "./pages/Vendor/ManageBooking"
import UpdateVendorProfile from "./pages/Vendor/UpdateVendorProfile"
import VendorProfile from "./pages/Vendor/VendorProfile"
import ServiceDetails from "./pages/Vendor/AddService/ServiceDetails"
import UserDetails from "./pages/customer/UserDetails"
import EditService from "./pages/Vendor/AddService/EditService" // Add this import
import LeaveReview from "./pages/LeaveReview"
import VendorMyReviews from "./pages/Vendor/VendorMyReviews"
import VendorRecommendation from "./pages/VendorRecommendation"
import TestRecommendation from "./pages/TestRecommendation"
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
            path="/user/details"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDetails />
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
          <Route
            path="/vendor/profile"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorProfile />
              </ProtectedRoute>
            }
          />
          {/* Update Vendor Profile Route */}
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
            path="/vendor-recommendations"
            element={
              <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                <VendorRecommendation />
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
          <Route
            path="/services/:serviceId"
            element={
              <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                <ServiceDetails />
              </ProtectedRoute>
            }
          />
          {/* Add Edit Service Route */}
          <Route
            path="/edit-service/:serviceId"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <EditService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={["user", "vendor", "admin"]}>
                <BookingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addservice"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <AddService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/manage-bookings"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <ManageBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/my-reviews"
            element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorMyReviews />
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