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
import AddService from "./pages/AddService/AddService"


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
             path="/addservice" 
             element={
             <ProtectedRoute allowedRoles={["vendor"]}>
             <AddService/>
            </ProtectedRoute>}
             />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        
      </div>
    </Router>
  )
}

export default App
