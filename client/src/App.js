/**
 * Main App Component - Achilles Ltd Management System
 * 
 * This is the root component that handles:
 * - User authentication state
 * - Routing between pages
 * - Protected routes (login required for dashboard/admin)
 * - Persistent login using localStorage
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
  // State to store logged-in user information
  const [user, setUser] = useState(null);
  // Loading state to prevent flash of incorrect content
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // If token and user data exist, restore the session
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Called when user successfully logs in or registers
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // Called when user clicks logout button
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Login page - redirect to dashboard if already logged in */}
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Register page - redirect to dashboard if already logged in */}
            <Route 
              path="/register" 
              element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Dashboard - requires login */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            
            {/* Upload Document - requires login */}
            <Route 
              path="/upload-document" 
              element={user ? <UploadDocument /> : <Navigate to="/login" />} 
            />
            
            {/* Documents - requires login */}
            <Route 
              path="/documents" 
              element={user ? <Documents /> : <Navigate to="/login" />} 
            />
            
            {/* Admin panel - requires login AND admin role */}
            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Home page - redirects based on login status */}
            <Route 
              path="/" 
              element={<Navigate to={user ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
