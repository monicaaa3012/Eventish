import React from "react";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Vendor Dashboard</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      </div>
      <p>Welcome, vendor!</p>
    </div>
  );
};

export default VendorDashboard;
