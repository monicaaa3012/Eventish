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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5">
              <div className="display-1 text-danger mb-4">
                <i className="fas fa-ban"></i>
              </div>

              <h1 className="display-4 text-danger mb-3">403</h1>
              <h2 className="h4 mb-3">Access Denied</h2>

              <p className="text-muted mb-4">
                You don't have permission to access this resource. Please check your credentials or contact an
                administrator.
              </p>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <button className="btn btn-primary me-md-2" onClick={handleGoBack}>
                  <i className="fas fa-arrow-left me-2"></i>Go Back
                </button>

                <button className="btn btn-outline-primary me-md-2" onClick={handleGoHome}>
                  <i className="fas fa-home me-2"></i>Home
                </button>

                <button className="btn btn-outline-secondary" onClick={handleLogin}>
                  <i className="fas fa-sign-in-alt me-2"></i>Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
