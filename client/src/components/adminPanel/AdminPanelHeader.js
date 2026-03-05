import React from 'react';

function AdminPanelHeader({ activeTab, setActiveTab, totalUsers }) {
  // Small helper to keep tab button style easy to read
  const getTabStyle = (isActive) => {
    return {
      color: isActive ? '#0d6efd' : 'white',
      backgroundColor: isActive ? 'white' : 'transparent',
      border: 'none',
      cursor: 'pointer'
    };
  };

  return (
    <div className="card-header bg-primary text-white">
      <div className="d-flex justify-content-between">
        <div>
          <h2>
            <i className="bi bi-shield-lock me-2"></i>
            Admin Panel
          </h2>
          <p className="mb-0 opacity-75 small">User Management & System Administration</p>
        </div>

        <div className="bg-light text-primary rounded px-3 py-2">
          <i className="bi bi-people-fill me-2"></i>
          <strong>{totalUsers}</strong> Users
        </div>
      </div>

      {/* Top tabs to switch between admin views */}
      <div className="mt-3">
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
              style={getTabStyle(activeTab === 'users')}
            >
              <i className="bi bi-people me-2"></i>
              User Management
            </button>
          </li>

          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'processing' ? 'active' : ''}`}
              onClick={() => setActiveTab('processing')}
              style={getTabStyle(activeTab === 'processing')}
            >
              <i className="bi bi-clock-history me-2"></i>
              Processing Times
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AdminPanelHeader;
