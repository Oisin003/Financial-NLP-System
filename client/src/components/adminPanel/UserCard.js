import React from 'react';

function UserCard({ user, onDeleteUser }) {
  // Keep date formatting in one place for readability
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isAdmin = user.role === 'admin';

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 hover-shadow">
        <div className="card-body">
          <div className="text-center mb-3">
            <div
              className="bg-light text-primary rounded-circle"
              style={{ width: '70px', height: '70px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <i className="bi bi-person-fill fs-1"></i>
            </div>
          </div>

          <h6 className="text-center">{user.username}</h6>

          <p className="text-center text-muted">
            <i className="bi bi-envelope me-1"></i>
            {user.email}
          </p>

          <div className="text-center">
            <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} px-3 py-2`}>
              <i className={`bi ${isAdmin ? 'bi-shield-fill-check' : 'bi-person-badge'} me-1`}></i>
              {user.role.toUpperCase()}
            </span>
          </div>

          <div className="text-center">
            <small className="text-muted">
              <i className="bi bi-calendar-check me-1"></i>
              Joined {joinedDate}
            </small>
          </div>

          <div>
            <button
              onClick={() => onDeleteUser(user.id)}
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
  );
}

export default UserCard;
