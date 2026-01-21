/**
 * Register Component - User Registration Page
 * 
 * Features:
 * - Username, email, password, and confirm password fields
 * - Strong password validation (8+ chars, upper, lower, number, special char)
 * - Client-side validation before API call
 * - Password match verification
 * - Error message display
 * - Loading spinner during registration
 * - Link to login page
 * - Calls backend API at http://localhost:8080/api/auth/register
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Register({ onLogin }) {
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update form fields as user types
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors([]); // Clear errors when user starts typing
  };

  // Validate password strength (must meet all requirements)
  const validatePassword = (password) => {
    const rules = [
      { test: /.{8,}/, message: 'Password must be at least 8 characters long' },
      { test: /[A-Z]/, message: 'Password must contain at least one uppercase letter' },
      { test: /[a-z]/, message: 'Password must contain at least one lowercase letter' },
      { test: /[0-9]/, message: 'Password must contain at least one number' },
      { test: /[@$!%*?&#]/, message: 'Password must contain at least one special character (@$!%*?&#)' }
    ];

    // Return array of failed validation messages
    const errors = rules
      .filter(rule => !rule.test.test(password))
      .map(rule => rule.message);

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Client-side validation
    const passwordErrors = validatePassword(formData.password);
    
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors(['Passwords do not match']);
      setLoading(false);
      return;
    }

    try {
      // Send registration request to backend
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from server
        if (data.errors) {
          setErrors(data.errors.map(err => err.msg));
        } else {
          setErrors([data.message || 'Registration failed']);
        }
        return;
      }

      // Registration successful - automatically log in the user
      onLogin(data.user, data.token);
    } catch (err) {
      setErrors([err.message || 'An error occurred']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <div className="card border-0 fade-in-up">
            <div className="card-body p-5">
              {/* Register icon */}
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle mb-3" 
                     style={{width: '80px', height: '80px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-person-plus-fill"></i>
                </div>
                <h2 className="fw-bold mb-2">Create Account</h2>
                <p className="text-muted">Join Achilles Ltd Financial System</p>
              </div>

              {errors.length > 0 && (
                <div className="alert alert-danger" role="alert">
                  <div className="d-flex align-items-start">
                    <i className="bi bi-exclamation-triangle-fill fs-5 me-2 mt-1"></i>
                    <ul className="mb-0 ps-3">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="form-label fw-bold">
                    <i className="bi bi-person-badge me-2"></i>Username
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength="3"
                    placeholder="Choose a username (min 3 characters)"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-bold">
                    <i className="bi bi-envelope me-2"></i>Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@company.com"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-bold">
                    <i className="bi bi-key me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a strong password"
                  />
                  <div className="alert alert-info mt-2 py-2 px-3">
                    <small className="d-flex align-items-start">
                      <i className="bi bi-info-circle-fill me-2 mt-1"></i>
                      <div>
                        <strong>Requirements:</strong> 8+ characters, uppercase, lowercase, number, special character (@$!%*?&#)
                      </div>
                    </small>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-bold">
                    <i className="bi bi-shield-check me-2"></i>Confirm Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter your password"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-3 border-top">
                <p className="text-muted mb-0">
                  Already have an account? 
                  <Link to="/login" className="text-primary text-decoration-none fw-bold ms-2">
                    Sign In <i className="bi bi-arrow-right"></i>
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="card border-0 mt-3 glass-effect text-white">
            <div className="card-body text-center py-3">
              <small>
                <i className="bi bi-lock-fill me-2"></i>
                Your password is encrypted and securely stored
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
