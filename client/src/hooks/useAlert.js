import { useState } from 'react';
import { ALERT_TYPES } from '../utils/alertUtils';

/**
 * Custom Hook for Managing Alert Messages
 * 
 * Makes it super easy to show success/error/warning/info messages in your components
 * 
 * Usage Example:
 *   const { message, showSuccess, showError, clearMessage } = useAlert();
 *   
 *   // Show a success message
 *   showSuccess('File uploaded successfully!');
 *   
 *   // Show an error
 *   showError('Upload failed. Please try again.');
 *   
 *   // In your JSX:
 *   <AlertMessage message={message} onClose={clearMessage} />
 */
export function useAlert() {
  // Store the current alert message and type
  const [message, setMessage] = useState({ type: '', text: '' });

  // Show a success message (green alert with checkmark)
  const showSuccess = (text) => {
    setMessage({ type: ALERT_TYPES.SUCCESS, text });
  };

  // Show an error message (red alert with warning icon)
  const showError = (text) => {
    setMessage({ type: ALERT_TYPES.ERROR, text });
  };

  // Show a warning message (yellow alert)
  const showWarning = (text) => {
    setMessage({ type: ALERT_TYPES.WARNING, text });
  };

  // Show an info message (blue alert)
  const showInfo = (text) => {
    setMessage({ type: ALERT_TYPES.INFO, text });
  };

  // Clear/hide the current message
  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // Return everything so components can use it
  return {
    message,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearMessage,
    setMessage  // Also expose setMessage for direct control if needed
  };
}
