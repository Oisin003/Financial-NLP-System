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
      <div className="upload-icon-container" 
           style={{width: '80px', height: '80px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
        <i className="upload-icon" style={{ fontSize: '3rem' }}></i>
      </div>

      {/* Instructions */}
      <h5 className="drop-zone-title">Drag and drop your PDF here</h5>
      <p className="drop-zone-subtitle">or click to browse</p>
      
      {/* Hidden file input */}
      <input
        type="file"
        id="fileInput"
        accept=".pdf"
        onChange={onFileSelect}
        className="hidden"
      />
      <label htmlFor="fileInput" className="choose-file-button">
        <i className="folder-icon"></i>
        Choose File
      </label>
      
      {/* File requirements */}
      <div className="file-requirements">
        <div className="requirements-row">
          <div className="requirement-item">
            <i className="pdf-icon"></i>
            <strong>Format:</strong> PDF only
          </div>
          <div className="requirement-item">
            <i className="size-icon"></i>
            <strong>Max Size:</strong> 10MB
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileDropZone;
