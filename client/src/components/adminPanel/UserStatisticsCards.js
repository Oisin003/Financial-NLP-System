import React from 'react';

function UserStatisticsCards({ totalUserCount, adminCount, regularUserCount }) {
  return (
    <div className="row mb-3">
      <div className="col-md-4">
        <div className="card bg-light h-100 hover-shadow">
          <div className="card-body p-4">
            <div className="d-flex align-items-center">
              <div className="bg-primary text-white rounded p-3 me-3">
                <i className="bi bi-people-fill fs-3"></i>
              </div>
              <div>
                <small className="text-muted d-block mb-1">Total Users</small>
                <h3 className="mb-0">{totalUserCount}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card bg-light h-100 hover-shadow">
          <div className="card-body p-4">
            <div className="d-flex align-items-center">
              <div className="bg-danger text-white rounded p-3 me-3">
                <i className="bi bi-shield-fill-check fs-3"></i>
              </div>
              <div>
                <small className="text-muted d-block mb-1">Administrators</small>
                <h3 className="mb-0 fw-bold">{adminCount}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card bg-light h-100 hover-shadow">
          <div className="card-body p-4">
            <div className="d-flex align-items-center">
              <div className="bg-success text-white rounded p-3 me-3">
                <i className="bi bi-person-check-fill fs-3"></i>
              </div>
              <div>
                <small className="text-muted d-block mb-1">Regular Users</small>
                <h3 className="mb-0 fw-bold">{regularUserCount}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStatisticsCards;
