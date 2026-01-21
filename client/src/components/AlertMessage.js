/**
 * Alert Message Component
 * Shows success, error, or warning messages to the user
 */

import React from 'react';

function AlertMessage({ message, onClose }) {
  // Don't show anything if there's no message
  if (!message.text) return null;

  // Choose the right icon based on message type
  const icon = message.type === 'success' 
    ? 'bi-check-circle-fill' 
    : 'bi-exclamation-triangle-fill';

  return (
    <div className={`alert alert-${message.type} alert-dismissible fade show d-flex align-items-center`} role="alert">
      <i className={`bi ${icon} fs-5 me-2`}></i>
      <span>{message.text}</span>
      <button 
        type="button" 
        className="btn-close" 
        onClick={onClose}
      ></button>
    </div>
  );
}

export default AlertMessage;
