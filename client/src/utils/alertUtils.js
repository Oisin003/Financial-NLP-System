// Alert type definitions - makes it easy to know what types are available
export const ALERT_TYPES = {
  SUCCESS: 'success',  // Green alert for successful actions
  ERROR: 'danger',     // Red alert for errors
  WARNING: 'warning',  // Yellow alert for warnings
  INFO: 'info'         // Blue alert for information
};

// Returns the correct icon for each alert type
// Makes alerts more visual and easier to understand at a glance
export const getAlertIcon = (type) => {
  const icons = {
    success: 'bi-check-circle-fill',           // Checkmark for success
    danger: 'bi-exclamation-triangle-fill',    // Warning triangle for errors
    warning: 'bi-exclamation-triangle-fill',   // Warning triangle
    info: 'bi-info-circle-fill'                // Info circle
  };
  
  return icons[type] || 'bi-info-circle-fill';
};

// Returns user-friendly alert colors based on type
export const getAlertClass = (type) => {
  return `alert alert-${type} alert-dismissible fade show`;
};
