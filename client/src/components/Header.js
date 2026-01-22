import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

function Header({ user, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <Logo />
          <span className="ms-3 fw-bold">Achilles Ltd</span>
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            {user ? (
              <>
                <li className="nav-item me-3">
                  <span className="navbar-text text-light">
                    <i className="bi bi-person-circle me-2"></i>
                    <strong>{user.username}</strong>
                    {user.role === 'admin' && (
                      <span className="badge bg-warning text-dark ms-2">Admin</span>
                    )}
                  </span>
                </li>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">
                    <i className="bi bi-speedometer2 me-2"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/documents" className="nav-link">
                    <i className="bi bi-folder2-open me-2"></i>
                    {user.role === 'admin' ? 'All Documents' : 'My Documents'}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/upload-document" className="btn btn-light btn-sm">
                    <i className="bi bi-cloud-upload me-2"></i>Upload
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link to="/admin" className="nav-link">
                      <i className="bi bi-shield-lock me-2"></i>Admin Panel
                    </Link>
                  </li>
                )}
                <li className="nav-item ms-2">
                  <button onClick={onLogout} className="btn btn-outline-light btn-sm">
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-outline-light btn-sm ms-2">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
