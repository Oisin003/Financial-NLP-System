/**
 * File Drop Zone Component
 * Provides drag-and-drop area for file selection
 */

import React from 'react';

function FileDropZone({ onFileSelect, onDrop, onDragOver }) {
  return (
    <div 
      className="border rounded p-4 text-center mb-3"
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ 
        backgroundColor: '#f8f9fa',
        cursor: 'pointer'
      }}
    >
      {/* Upload icon */}
      <div className="bg-light rounded-circle mb-3" 
           style={{width: '80px', height: '80px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
        <i className="bi bi-cloud-upload text-primary" style={{ fontSize: '3rem' }}></i>
      </div>

      {/* Instructions */}
      <h5 className="fw-bold mb-2">Drag and drop your PDF here</h5>
      <p className="text-muted mb-3">or click to browse</p>
      
      {/* Hidden file input */}
      <input
        type="file"
        id="fileInput"
        accept=".pdf"
        onChange={onFileSelect}
        className="d-none"
      />
      <label htmlFor="fileInput" className="btn btn-primary">
        <i className="bi bi-folder2-open me-2"></i>
        Choose File
      </label>
      
      {/* File requirements */}
      <div className="mt-3">
        <div className="row">
          <div className="col-md-6">
            <i className="bi bi-file-pdf me-2 text-danger"></i>
            <strong>Format:</strong> PDF only
          </div>
          <div className="col-md-6">
            <i className="bi bi-hdd me-2 text-primary"></i>
            <strong>Max Size:</strong> 10MB
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileDropZone;
