/**
 * Upload Guidelines Component
 * Displays upload rules and information
 */

import React from 'react';

function UploadGuidelines() {
  return (
    <div className="mt-3 p-3 bg-light rounded">
      <h6 className="mb-2">
        <i className="bi bi-info-circle me-2"></i>
        Upload Guidelines
      </h6>
      <ul className="mb-0 small">
        <li>PDF only</li>
        <li>Maximum file size is 10MB</li>
        <li>You can view all your documents on the Documents page</li>
      </ul>
    </div>
  );
}

export default UploadGuidelines;
