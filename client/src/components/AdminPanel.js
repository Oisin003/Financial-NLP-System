/**
 * AdminPanel Component - User Management Interface
 * 
 * Features:
 * - Displays all registered users in a table
 * - Shows username, email, role, and creation date
 * - Delete user functionality with confirmation
 * - Admin-only access (protected by routing)
 * - Loading spinner while fetching data
 * - Error handling and display
 * - Calls backend API at http://localhost:8080/api/users
 */

import React, { useState, useEffect } from 'react';
import API_URL from '../config';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users when component loads
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}` // Send JWT token for authentication
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a user (with confirmation)
  const handleDeleteUser = async (userId) => {
    // Ask for confirmation before deleting
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove deleted user from local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          {/* Admin panel */}
          <div className="card mb-3">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between">
                {/* Title */}
                <div>
                  <h2>
                    <i className="bi bi-shield-lock me-2"></i>
                    Admin Panel
                  </h2>
                  <p className="mb-0 opacity-75 small">User Management & System Administration</p>
                </div>
                {/* Right side: Total users count badge */}
                <div className="bg-light text-primary rounded px-3 py-2">
                  <i className="bi bi-people-fill me-2"></i>
                  <strong>{users.length}</strong> Users
                </div>
              </div>
            </div>
            <div className="card-body">
              {/* Error alert */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
                  <span>{error}</span>
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
              )}

              {/* Statistics */}
              <div className="row mb-3">
                {/* Total users card */}
                <div className="col-md-4">
                  <div className="card bg-light h-100 hover-shadow">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded p-3 me-3">
                          <i className="bi bi-people-fill fs-3"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Total Users</small>
                          <h3 className="mb-0">{users.length}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Administrators count card */}
                <div className="col-md-4">
                  <div className="card bg-light h-100 hover-shadow">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-danger text-white rounded p-3 me-3">
                          <i className="bi bi-shield-fill-check fs-3"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Administrators</small>
                          <h3 className="mb-0 fw-bold">{users.filter(u => u.role === 'admin').length}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Regular users count card */}
                <div className="col-md-4">
                  <div className="card bg-light h-100 hover-shadow">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-success text-white rounded p-3 me-3">
                          <i className="bi bi-person-check-fill fs-3"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Regular Users</small>
                          <h3 className="mb-0 fw-bold">{users.filter(u => u.role !== 'admin').length}</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users */}
              <div>
                <h5>
                  <i className="bi bi-people me-2"></i>
                  User Management
                </h5>
              </div>
              
              {/* User cards */}
              <div className="row">
                {users.map(user => (
                  <div key={user.id} className="col-md-6 col-lg-4">
                    {/* User card */}
                    <div className="card h-100 hover-shadow">
                      <div className="card-body">
                        {/* User avatar icon */}
                        <div className="text-center mb-3">
                          <div className="bg-light text-primary rounded-circle" 
                               style={{width: '70px', height: '70px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                            <i className="bi bi-person-fill fs-1"></i>
                          </div>
                        </div>
                        
                        {/* Username */}
                        <h6 className="text-center">{user.username}</h6>
                        
                        {/* Email */}
                        <p className="text-center text-muted">
                          <i className="bi bi-envelope me-1"></i>
                          {user.email}
                        </p>
                        
                        {/* Role */}
                        <div className="text-center">
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'} px-3 py-2`}>
                            <i className={`bi ${user.role === 'admin' ? 'bi-shield-fill-check' : 'bi-person-badge'} me-1`}></i>
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Created date */}
                        <div className="text-center">
                          <small className="text-muted">
                            <i className="bi bi-calendar-check me-1"></i>
                            Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </small>
                        </div>
                        
                        {/* Delete button */}
                        <div>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="btn btn-outline-danger"
                            title="Delete this user account"
                          >
                            <i className="bi bi-trash me-2"></i>
                            Delete User
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* No users */}
              {users.length === 0 && (
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <i className="bi bi-info-circle-fill fs-1 text-primary mb-3 d-block"></i>
                    <p className="mb-0">No users found in the system.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
