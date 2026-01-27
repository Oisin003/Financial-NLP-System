/**
 * Main App Component - Entry Point for the React Application
 * 
 * How it works:
 * 1. On load, checks localStorage for saved login info
 * 2. If found, automatically logs user in
 * 3. Manages routing to different pages (login, dashboard, admin, etc.)
 * 4. Protects routes that require authentication
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import UploadDocument from './components/UploadDocument';
import Documents from './components/Documents';
import './App.css';

function App() {
  // --- STATE MANAGEMENT ---
  
  // user: stores current logged-in user's info (username, email, role)
  // null = not logged in
  const [user, setUser] = useState(null);
  
  // loading: true while checking if user was previously logged in
  const [loading, setLoading] = useState(true);

  // --- CHECK FOR SAVED LOGIN ON PAGE LOAD ---
  useEffect(() => {
    // Look for saved token and user data in localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // If both exist, user was logged in before - restore their session
    if (token && userData) {
      setUser(JSON.parse(userData));  // Convert JSON string to object
    }
    
    // Done checking, stop showing loading spinner
    setLoading(false);
  }, []);  // Empty array = run only once on component mount

  /**
   * Handle Successful Login
   * Called by Login and Register components when user logs in
   * 
   * @param {Object} userData - User info (id, username, email, role)
   * @param {string} token - JWT authentication token
   */
  const handleLogin = (userData, token) => {
    // Save to localStorage so user stays logged in after page refresh
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Update state to trigger re-render
    setUser(userData);
  };

  /**
   * Handle Logout
   * Called when user clicks logout button in Header
   */
  const handleLogout = () => {
    // Remove saved login info
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear user state (will redirect to login page)
    setUser(null);
  };

  // --- LOADING SCREEN ---
  // Show spinner while checking for saved login
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // --- MAIN APP LAYOUT ---
  return (
    <Router>
      <div className="App">
        {/* Header with navigation - shown on all pages */}
        <Header user={user} onLogout={handleLogout} />
        
        {/* Main content area - different component based on current route */}
        <main className="main-content">
          <Routes>
            {/* Public routes - redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Protected routes - redirect to login if not logged in */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/upload-document" 
              element={user ? <UploadDocument /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/documents" 
              element={user ? <Documents /> : <Navigate to="/login" />} 
            />
            
            {/* Admin-only route - requires admin role */}
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Home route - redirects based on login status */}
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </main>
        
        {/* Footer - shown on all pages */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
