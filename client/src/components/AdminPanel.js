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
import ProcessingTimes from './ProcessingTimes';
import AdminPanelHeader from './adminPanel/AdminPanelHeader';
import UserManagementTab from './adminPanel/UserManagementTab';

function AdminPanel() {
  // Store all users returned from the API
  const [users, setUsers] = useState([]);

  // Show a loading spinner while data is being fetched
  const [loading, setLoading] = useState(true);

  // Store any error message we want to show in the UI
  const [error, setError] = useState('');

  // Controls which tab is visible
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'processing'

  // ----- Calculated values (derived from `users`) -----
  const totalUserCount = users.length;

  const adminCount = users.filter(function(user) {
    return user.role === 'admin';
  }).length;

  const regularUserCount = users.filter(function(user) {
    return user.role !== 'admin';
  }).length;

  // Run once on first render to get users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Get users from backend API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}` // Send JWT auth token
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

  // Delete one user after confirmation
  const handleDeleteUser = async (userId) => {
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

      // Remove deleted user from UI list immediately
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Show spinner while users are loading
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
          <div className="card mb-3">
            <AdminPanelHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              totalUsers={users.length}
            />

            <div className="card-body">
              {activeTab === 'users' && (
                <UserManagementTab
                  users={users}
                  error={error}
                  totalUserCount={totalUserCount}
                  adminCount={adminCount}
                  regularUserCount={regularUserCount}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {activeTab === 'processing' && (
                <ProcessingTimes />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
