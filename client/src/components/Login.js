/**
 * Login Component - User Login Page
 * 
 * This is the page where users sign in to their account.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';  // Backend server URL
import AlertMessage from './AlertMessage';  // Reusable alert component
import { useAlert } from '../hooks/useAlert';  // Custom hook for managing alerts

function Login({ onLogin }) {
  // --- STATE MANAGEMENT ---
  
  // Form data: stores email and password as user types
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  
  // Loading state: true while waiting for login response
  const [loading, setLoading] = useState(false);
  
  // Alert system: for showing error messages
  const { message, showError, clearMessage } = useAlert();

  /**
   * Handle form input changes
   * Updates formData state as user types
   */
  const handleChange = (e) => {
    setFormData({ 
      ...formData,  // Keep other fields
      [e.target.name]: e.target.value  // Update the field that changed
    });
    clearMessage();  // Clear any error message when user starts typing
  };

  /**
   * Handle form submission
   * Sends login request to backend API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page refresh
    setLoading(true);     // Show loading spinner
    clearMessage();       // Clear any previous errors

    try {
      // Step 1: Send POST request to login endpoint
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)  // Send email and password
      });

      // Step 2: Parse response
      const data = await response.json();
      
      // Step 3: Check if login failed
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Step 4: Login successful! Call onLogin with user data and token
      // This will update App state and redirect to dashboard
      onLogin(data.user, data.token);
      
    } catch (err) {
      // Step 5: If error, show it to user
      showError(err.message);
    } finally {
      // Always stop loading spinner (whether success or error)
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              
              {/* Header Section */}
              <div className="text-center mb-4">
                {/* Lock Icon */}
                <div 
                  className="bg-primary text-white rounded-circle mb-3 mx-auto" 
                  style={{
                    width: '80px', 
                    height: '80px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}
                >
                  <i className="bi bi-shield-lock-fill fs-1"></i>
                </div>
                <h2>Welcome Back</h2>
                <p className="text-muted">Login to Achilles Ltd Financial System</p>
              </div>

              {/* Error Message (only shows when there's an error) */}
              <AlertMessage message={message} onClose={clearMessage} />

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                {/* Email Input */}
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

                {/* Password Input */}
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

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mb-3" 
                  disabled={loading}  // Disable while loading
                >
                  {loading ? (
                    // Show spinner while logging in
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Authenticating...
                    </>
                  ) : (
                    // Show normal text when not loading
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                    </>
                  )}
                </button>

                {/* Link to Registration Page */}
                <div className="text-center">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary">Create Account</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
