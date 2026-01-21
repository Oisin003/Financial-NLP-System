/**
 * Login Component - User Authentication Page
 * 
 * Features:
 * - Email and password input fields
 * - Form validation
 * - Error message display
 * - Loading spinner during authentication
 * - Link to registration page
 * - Calls backend API at http://localhost:8080/api/auth/login
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login({ onLogin }) {
  // Form data state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update form fields as user types
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear errors when user starts typing
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send login request to backend
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful - call parent handler with user data and token
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              {/* Login icon */}
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle mb-3" 
                     style={{width: '80px', height: '80px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-shield-lock-fill"></i>
                </div>
                <h2>Welcome Back</h2>
                <p className="text-muted">Login to Achilles Ltd Financial System</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="user@achilles.com"
                  />
                </div>

                {/* Password field */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-key me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                {/* Submit button */}
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Register link */}
              <div className="text-center">
                <p className="text-muted">
                  Don't have an account? 
                  <Link to="/register" className="text-primary ms-2">
                    Create Account <i className="bi bi-arrow-right"></i>
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security info */}
          <div className="card mt-3 text-white" style={{background: 'rgba(255,255,255,0.1)'}}>
            <div className="card-body text-center py-3">
              <small>
                <i className="bi bi-shield-check me-2"></i>
                Secure authentication with industry-standard encryption
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
