/**
 * Login Component - User Login Page
 * 
 * This is the page where users sign in to their account.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import AlertMessage from './AlertMessage';
import { useAlert } from '../hooks/useAlert';
import LoginHeader from './login/LoginHeader';
import LoginSubmitButton from './login/LoginSubmitButton';

function Login({ onLogin }) {
  // Keep form values in one object (email + password)
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  // True while waiting for the login request to finish
  const [loading, setLoading] = useState(false);

  // Shared alert hook used across pages
  const { message, showError, clearMessage } = useAlert();

  // Update the field that changed (email or password)
  const handleChange = (e) => {
    const { name, value } = e.target;

    setCredentials({
      ...credentials,
      [name]: value
    });

    // Remove old error message when user edits input
    clearMessage();
  };

  // Send login request to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();

    const payload = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(data.errors.map((error) => error.msg).join(' | '));
        }
        throw new Error(data.message || 'Login failed');
      }

      // Parent component saves user + token and handles redirect
      onLogin(data.user, data.token);
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <LoginHeader />

              {/* Shows only when `message` exists */}
              <AlertMessage message={message} onClose={clearMessage} />

              {/* Login form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    placeholder="user@achilles.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-key me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                  />
                </div>

                <LoginSubmitButton loading={loading} />

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
