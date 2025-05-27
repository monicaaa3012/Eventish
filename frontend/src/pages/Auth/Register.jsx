"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForm.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Registration successful! Please sign in.");
        window.location.href = "/login";
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Registration failed");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="brand-logo">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <h1 className="brand-title">Eventish</h1>
          <p className="brand-subtitle">Your perfect event companion</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label"><i className="fas fa-user me-2"></i> Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control modern-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label"><i className="fas fa-envelope me-2"></i> Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control modern-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label"><i className="fas fa-lock me-2"></i> Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control modern-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label"><i className="fas fa-users me-2"></i> Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control modern-input"
              required
            >
              <option value="">Select your role</option>
              <option value="user">🎉 Customer</option>
              <option value="vendor">🏪 Vendor</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="modern-btn">
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <div className="spinner-border spinner-border-sm me-2" role="status" />
                Registering...
              </div>
            ) : "Sign Up"}
          </button>
        </form>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
