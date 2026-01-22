/**
 * Alert Message Component
 * 
 * Displays user-friendly alerts for success, errors, warnings, and info messages
 * 
 * Usage:
 *   <AlertMessage 
 *     message={{ type: 'success', text: 'Upload complete!' }} 
 *     onClose={() => handleClose()} 
 *   />
 * 
 * Message types: 'success', 'danger', 'warning', 'info'
 */

import React from 'react';
import { getAlertIcon, getAlertClass } from '../utils/alertUtils';

function AlertMessage({ message, onClose }) {
  // Don't render anything if there's no message to show
  if (!message.text) return null;

  // Get the appropriate icon and styling for this message type
  const icon = getAlertIcon(message.type);
  const alertClass = getAlertClass(message.type);

  return (
    <div className={`${alertClass} d-flex align-items-center`} role="alert">
      {/* Icon that matches the message type */}
      <i className={`bi ${icon} fs-5 me-2`}></i>
      
      {/* The actual message text */}
      <span>{message.text}</span>
      
      {/* Close button - clicking calls the onClose function */}
      <button 
        type="button" 
        className="btn-close" 
        onClick={onClose}
        aria-label="Close alert"
      ></button>
    </div>
  );
}

export default AlertMessage;
