/**
 * Selected File Card Component
 * Displays information about the selected file with remove option
 */

import React from 'react';
import { formatFileSize } from '../utils/fileUtils';

function SelectedFileCard({ file, onRemove }) {
  if (!file) return null;

  return (
    <div className="card bg-light mb-3">
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          {/* PDF icon */}
          <div className="bg-danger bg-opacity-10 rounded p-3 me-3">
            <i className="bi bi-file-earmark-pdf-fill text-danger" style={{ fontSize: '2.5rem' }}></i>
          </div>
          
          {/* File info */}
          <div className="flex-grow-1">
            <h6 className="mb-1">{file.name}</h6>
            <small className="text-muted">
              <i className="bi bi-hdd-fill me-1"></i>
              Size: {formatFileSize(file.size)}
            </small>
          </div>
          
          {/* Remove button */}
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={onRemove}
            title="Remove file"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectedFileCard;
