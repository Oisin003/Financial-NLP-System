import React from 'react';

function LoginSubmitButton({ loading }) {
  return (
    <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2"></span>
          Authenticating...
        </>
      ) : (
        <>
          <i className="bi bi-box-arrow-in-right me-2"></i>
          Sign In
        </>
      )}
    </button>
  );
}

export default LoginSubmitButton;
