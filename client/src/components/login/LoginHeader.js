import React from 'react';

function LoginHeader() {
  return (
    <div className="text-center mb-4">
      <div
        className="bg-primary text-white rounded-circle mb-3 mx-auto"
        style={{
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <i className="bi bi-shield-lock-fill fs-1"></i>
      </div>

      <h2>Welcome Back</h2>
      <p className="text-muted">Login to Achilles Ltd Financial System</p>
    </div>
  );
}

export default LoginHeader;
