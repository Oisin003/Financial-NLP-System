import React from 'react';
import UserStatisticsCards from './UserStatisticsCards';
import UserCard from './UserCard';

function UserManagementTab({
  users,
  error,
  totalUserCount,
  adminCount,
  regularUserCount,
  onDeleteUser
}) {
  return (
    <>
      {/* Show API/user action errors in a visible alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5 me-2"></i>
          <span>{error}</span>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      <UserStatisticsCards
        totalUserCount={totalUserCount}
        adminCount={adminCount}
        regularUserCount={regularUserCount}
      />

      <div>
        <h5>
          <i className="bi bi-people me-2"></i>
          User Management
        </h5>
      </div>

      <div className="row">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onDeleteUser={onDeleteUser} />
        ))}
      </div>

      {users.length === 0 && (
        <div className="card bg-light">
          <div className="card-body text-center">
            <i className="bi bi-info-circle-fill fs-1 text-primary mb-3 d-block"></i>
            <p className="mb-0">No users found in the system.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default UserManagementTab;
