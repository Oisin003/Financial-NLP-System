/**
 * Dashboard Component - User Profile Page
 * 
 * Features:
 * - Displays logged-in user information
 * - Shows username, email, and role
 * - Special message for administrators
 * - Role badge with color coding (admin=red, user=blue)
 * - Loading state for safety
 */

import React from 'react';

function Dashboard({ user }) {
  // Safety check - ensure user data is loaded
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8">
          {/* Professional Welcome Card */}
          <div className="card border-0 mb-4">
            <div className="card-header text-white text-center py-4">
              <h2 className="mb-0 fw-bold">
                <i className="bi bi-speedometer2 me-2"></i>
                Welcome to Your Dashboard
              </h2>
              <p className="mb-0 mt-2 opacity-75">Achilles Ltd Financial Management System</p>
            </div>
            <div className="card-body p-5">
              {/* User Profile Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h3 className="mb-0 fw-bold">{user.username || 'N/A'}</h3>
                    <p className="mb-0 text-muted">
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'} me-2`}>
                        {(user.role || 'user').toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="p-3 rounded bg-light border-start border-primary border-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-badge fs-3 text-primary me-3"></i>
                      <div>
                        <small className="text-muted d-block">Username</small>
                        <strong className="fs-6">{user.username || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded bg-light border-start border-info border-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-envelope fs-3 text-info me-3"></i>
                      <div>
                        <small className="text-muted d-block">Email Address</small>
                        <strong className="fs-6">{user.email || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded bg-light border-start border-success border-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-shield-check fs-3 text-success me-3"></i>
                      <div>
                        <small className="text-muted d-block">Account Role</small>
                        <strong className="fs-6">{(user.role || 'user').toUpperCase()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded bg-light border-start border-warning border-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock-history fs-3 text-warning me-3"></i>
                      <div>
                        <small className="text-muted d-block">Status</small>
                        <strong className="fs-6 text-success">Active</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Alerts */}
              <div className="alert alert-info d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill fs-4 me-3"></i>
                <div>
                  <strong>System Access Confirmed</strong>
                  <p className="mb-0 small">You are successfully logged into Achilles Ltd management system.</p>
                </div>
              </div>
              
              {user.role === 'admin' && (
                <div className="alert alert-warning d-flex align-items-center" role="alert">
                  <i className="bi bi-star-fill fs-4 me-3"></i>
                  <div>
                    <strong>Administrator Access Granted</strong>
                    <p className="mb-0 small">You have elevated privileges to access the Admin Panel and manage all users.</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-3">
                <h5>
                  <i className="bi bi-lightning-fill me-2 text-warning"></i>
                  Quick Actions
                </h5>
                <div className="row">
                  {/* Upload card */}
                  <div className="col-md-4">
                    <div className="card bg-light hover-shadow">
                      <div className="card-body text-center p-4">
                        <div className="bg-primary text-white rounded-circle mb-3" 
                             style={{width: '50px', height: '50px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                          <i className="bi bi-file-earmark-arrow-up fs-4"></i>
                        </div>
                        <h6>Upload Document</h6>
                        <p className="text-muted">Add new financial documents</p>
                        <button className="btn btn-primary btn-sm w-100">
                          Go to Upload
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* View documents action card */}
                  <div className="col-md-4">
                    <div className="card bg-light hover-shadow h-100">
                      <div className="card-body text-center p-4">
                        <div className="bg-info text-white rounded-circle mb-3" 
                             style={{width: '50px', height: '50px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                          <i className="bi bi-folder2-open fs-4"></i>
                        </div>
                        <h6 className="fw-bold mb-2">View Documents</h6>
                        <p className="text-muted small mb-3">Browse all your documents</p>
                        <button className="btn btn-info btn-sm w-100">
                          Go to Documents
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Admin panel action card - only for admins */}
                  {user.role === 'admin' && (
                    <div className="col-md-4">
                      <div className="card bg-light hover-shadow h-100">
                        <div className="card-body text-center p-4">
                          <div className="bg-danger text-white rounded-circle mb-3" 
                               style={{width: '50px', height: '50px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                            <i className="bi bi-shield-lock fs-4"></i>
                          </div>
                          <h6 className="fw-bold mb-2">Admin Panel</h6>
                          <p className="text-muted small mb-3">Manage users and settings</p>
                          <button className="btn btn-danger btn-sm w-100">
                            Go to Admin
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
