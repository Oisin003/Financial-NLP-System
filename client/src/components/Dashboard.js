import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ user }) {
  if (!user) return null;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header text-white text-center py-4">
              <h2 className="mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                Welcome to Your Dashboard
              </h2>
            </div>
            
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <h3 className="mb-0">{user.username}</h3>
                  <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                    {user.role?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-person-badge text-primary me-2"></i>
                    <strong>Username:</strong> {user.username}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded">
                    <i className="bi bi-envelope text-info me-2"></i>
                    <strong>Email:</strong> {user.email}
                  </div>
                </div>
              </div>

              {user.role === 'admin' && (
                <div className="alert alert-warning mb-4">
                  <i className="bi bi-star-fill me-2"></i>
                  <strong>Administrator Access</strong>
                </div>
              )}

              <h5 className="mb-3">Quick Actions</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <Link to="/upload-document" className="btn btn-primary w-100">
                    <i className="bi bi-upload me-2"></i>
                    Upload Document
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/documents" className="btn btn-info w-100">
                    <i className="bi bi-folder2-open me-2"></i>
                    View Documents
                  </Link>
                </div>
                {user.role === 'admin' && (
                  <div className="col-md-4">
                    <Link to="/admin" className="btn btn-danger w-100">
                      <i className="bi bi-shield-lock me-2"></i>
                      Admin Panel
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
